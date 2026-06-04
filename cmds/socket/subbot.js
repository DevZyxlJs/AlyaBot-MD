import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import makeWASocket, { Browsers, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, DisconnectReason, jidDecode, useMultiFileAuthState } from 'baileys';
import NodeCache from 'node-cache';
import handler from '#handler';
import events from '#events';
import qrcode from "qrcode";
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { smsg, patchGroupMetadata } from '#serialize';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

if (!global.conns) global.conns = [];
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });
let reintentos = {};
let commandFlags = {};
global.SUBBOTSESSIONS = new Map()

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0];

export async function startSubBot(
  msg,
  client,
  caption = '',
  isCode = false,
  phone = '',
  chatId = '',
  isCommand = false,
) {
  const id = phone || (msg?.sender || '').split('@')[0];
  const sessionFolder = `./Sessions/Subs/${id}`;
  const senderId = msg?.sender;

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const msgStore = new Map();
  const msgLimit = 500;
  console.info = () => {};
  const clientes = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.windows('Chrome'),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
    shouldIgnoreJid: (jid) => jid.endsWith('@broadcast'),
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    keepAliveIntervalMs: 30_000,
    msgRetryCounterCache,
    userDevicesCache,
    getMessage: async (key) => msgStore.get(key.remoteJid + ':' + key.id),
  });
  patchGroupMetadata(clientes);

  clientes.isInit = false;
  clientes.commandTriggered = isCommand;
  clientes.triggerSender = senderId;
  clientes.triggerChatId = chatId;
  clientes.triggerClient = client;
  clientes.triggerIsCode = isCode;
  clientes.sessionFolder = sessionFolder;
  
  clientes.ev.on('creds.update', saveCreds);

  clientes.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
    }
    return jid;
  };
  let bootTime = Date.now();
  let botReady = false;
  clientes.ev.on('messages.upsert', async ({ messages, type }) => {
    if (!botReady) return;
    if (type !== 'notify') return;
    for (const raw of messages) {
      if (raw?.message && raw?.key?.id) {
        const sid = raw.key.remoteJid + ':' + raw.key.id;
        msgStore.set(sid, raw.message);
        if (msgStore.size > msgLimit) msgStore.delete(msgStore.keys().next().value);
      }
      try {
        if (!raw?.message || raw.key?.remoteJid === 'status@broadcast') continue;
        if ((raw.messageTimestamp * 1000) < bootTime - 15_000) continue;
        if (raw.message.ephemeralMessage) raw.message = raw.message.ephemeralMessage.message;
        const m = await smsg(clientes, raw);
        if (typeof handler === 'function') handler(clientes, m, messages).catch((err) => console.error('[ ✿  ]  Main Sub »', err?.message || err));
      } catch (e) { console.log(e); }
    }
  });
  try { await events(clientes, null); } catch (err) { console.log(chalk.gray(`[ EVENT ERROR  ]  → ${err}`)); }

  clientes.ev.on('connection.update', async ({ connection, lastDisconnect, isNewLogin, qr }) => {
    if (isNewLogin) clientes.isInit = false;

    if (connection === 'open') {
      bootTime = Date.now();
      botReady = true;

      clientes.uptime = Date.now();
      clientes.isInit = true;
      clientes.userId = cleanJid(clientes.user?.id?.split('@')[0]);
      const botDir = clientes.userId + '@s.whatsapp.net';
      
      let settings = await getSettings(botDir);
      if (!settings) {
        settings = {};
      }

      settings.botmod = 0;
      settings.botprem = 0;
      settings.type = 'Sub';

      await updateSettings(botDir, 'botmod', settings.botmod);
      await updateSettings(botDir, 'botprem', settings.botprem);
      await updateSettings(botDir, 'type', settings.type);

      if (!global.conns.find((c) => c.userId === clientes.userId)) {
        global.conns.push(clientes);
      }

      delete reintentos[clientes.userId || id];
      await joinChannels(clientes);
      global.SUBBOTSESSIONS.set(botDir, clientes)
      console.log(chalk.gray(`[ ✿  ]  SUB-BOT conectado: ${clientes.userId}`));

      const sentFlagFile = path.join(clientes.sessionFolder, 'msg_sent.flag');
      const hasSentMessage = fs.existsSync(sentFlagFile);

      if (clientes.commandTriggered && !hasSentMessage && clientes.triggerClient && clientes.triggerChatId) {

       await client.sendMessage(msg.chat, { text: `✎ Has conectado un nuevo socket de tipo *Gratuito*.` }, { quoted: msg })

        fs.writeFileSync(sentFlagFile, '1'); 
        clientes.commandTriggered = false;
        
        if (commandFlags[clientes.triggerSender]) {
          delete commandFlags[clientes.triggerSender];
        }
      }
    }

    if (connection === 'close') {
      const botId = clientes.userId || id;
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.reason || 0;
      const intentos = reintentos[botId] || 0;
      reintentos[botId] = intentos + 1;

      if ([401, 403].includes(reason)) {
        if (intentos < 3) {
          console.log(
            chalk.gray(
              `[ ✿  ]  SUB-BOT ${botId} Conexión cerrada (código ${reason}) intento ${intentos}/3 → Reintentando...`,
            ),
          );
          setTimeout(() => {
            startSubBot(msg, client, caption, isCode, phone, chatId, isCommand);
          }, 3000);
        } else {
          global.SUBBOTSESSIONS.delete(botId + "@s.whatsapp.net");
          console.log(
            chalk.gray(`[ ✿  ]  SUB-BOT ${botId} Falló tras 3 intentos. Eliminando sesión.`),
          );
          try {
            fs.rmSync(sessionFolder, { recursive: true, force: true });
          } catch (e) {
            console.error(`[ ✿  ] No se pudo eliminar la carpeta ${sessionFolder}:`, e);
          }
          delete reintentos[botId];
        }
        return;
      }

      if (
        [
          DisconnectReason.connectionClosed,
          DisconnectReason.connectionLost,
          DisconnectReason.timedOut,
          DisconnectReason.connectionReplaced,
        ].includes(reason)
      ) {
        setTimeout(() => {
          startSubBot(msg, client, caption, isCode, phone, chatId, isCommand);
        }, 3000);
        return;
      }

      setTimeout(() => {
        startSubBot(msg, client, caption, isCode, phone, chatId, isCommand);
      }, 3000);
    }

    if (qr && isCode && phone && client && chatId && commandFlags[senderId]) {
      try {
        let codeGen = await clientes.requestPairingCode(phone);
        codeGen = codeGen.match(/.{1,4}/g)?.join("-") || codeGen;
        const msg2 = await msg.reply(caption);
        const msgCode = await msg.reply(codeGen);
        delete commandFlags[senderId];
        setTimeout(async () => {
          try {
            await client.sendMessage(chatId, { delete: msg2.key });
            await client.sendMessage(chatId, { delete: msgCode.key });
          } catch {}
        }, 60000);
      } catch (err) {
        console.error("[Código Error]", err);
      }
    }
    
    if (qr && !isCode && client && chatId && commandFlags[senderId]) {
      try {
        const msgQR = await client.sendMessage(msg.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption }, { quoted: msg });
        delete commandFlags[senderId];
        setTimeout(async () => {
          try {
            await client.sendMessage(chatId, { delete: msgQR.key });
          } catch {}
        }, 60000);
      } catch (err) {
        console.error("[QR Error]", err);
      }
    }
  });

  return clientes;
}

async function joinChannels(client) {
  for (const value of Object.values(global.my)) {
    if (typeof value === 'string' && value.endsWith('@newsletter')) {
      await client.newsletterFollow(value).catch(err => console.log(chalk.gray(`\n[ ✿ ] Error al seguir el canal ${value}`)));
    }
  }
}

export default {
  command: ['code', 'qr'],
  category: 'socket',
  run: async ({ msg, sock: client, args, command }) => {
    let user = await getUser(msg.sender);
    let time = user.Subs + 120000 || '';
    
    if (new Date() - user.Subs < 120000) {
      return client.reply(
        msg.chat,
        `❖ Debes esperar *${msToTime(time - new Date())}* para volver a intentar vincular un socket.`,
        msg,
      );
    }

    const subsPath = path.join(dirname, '../../Sessions/Subs');
    const subsCount = fs.existsSync(subsPath)
      ? fs.readdirSync(subsPath).filter((dir) => {
          const credsPath = path.join(subsPath, dir, 'creds.json');
          return fs.existsSync(credsPath);
        }).length
      : 0;

    const maxSubs = 20;
    if (subsCount >= maxSubs) {
      return client.reply(
        msg.chat,
        '✎ No se han encontrado espacios disponibles para registrar un `Sub-Bot`.\n\n𑁍ࠬܓ Recuerda que tambien puedes conectarte desde nuestra web oficial en el siguiente link.\n> ✐ https://stellarwa.xyz/register',
        msg,
      );
    }


    commandFlags[msg.sender] = true;

    const rtx = '`✤` Vincula tu *cuenta* usando el *codigo.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Selecciona *Vincular con el número de teléfono*\n\nꕤ *`Importante`*\n> ₊·( 🜸 ) ➭ Este *Código* solo funciona en el *número que lo solicito*';
    const rtx2 = "`✤` Vincula tu *cuenta* usando *codigo qr.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Escanea el código *QR.*\n\n> ₊·( 🜸 ) ➭ Recuerda que no es recomendable usar tu cuenta principal para registrar un socket.";

    const isCode = /^(code)$/.test(command);
    const isCommands = /^(code|qr)$/.test(command);
    const isCommand = isCommands ? true : false;
    const caption = isCode ? rtx : rtx2;
    const phone = args[0] ? args[0].replace(/\D/g, '') : msg.sender.split('@')[0];

    await startSubBot(msg, client, caption, isCode, phone, msg.chat, isCommand);
    user.Subs = new Date() * 1;

    await updateUser(msg.sender, 'Subs', user.Subs);
  }
};

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes > 0 ? minutes : '';
  seconds = seconds < 10 && minutes > 0 ? '0' + seconds : seconds;
  if (minutes) {
    return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`;
  } else {
    return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
  }
}