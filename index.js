import "./settings.js"
import handler from '#handler'
import events from '#events'
import makeWASocket, { Browsers, makeCacheableSignalKeyStore, useMultiFileAuthState, fetchLatestBaileysVersion, jidDecode, DisconnectReason } from 'baileys';
import pino from "pino";
import qrcode from "qrcode-terminal";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import readlineSync from "readline-sync";
import cmdsLoader from '#cmdsloader';
import { smsg, setCachedMeta } from "#serialize";
import database from "#database";
import { startSubBot } from '#cmds/socket/subbot';

const log = {
  info: (msg) => console.log(chalk.bgBlue.white.bold(` INFO `), chalk.white(msg)),
  success: (msg) => console.log(chalk.bgGreen.white.bold(` SUCCESS `), chalk.greenBright(msg)),
  warn: (msg) => console.log(chalk.bgYellow.black.bold(` WARNING `), chalk.yellow(msg)),
  error: (msg) => console.log(chalk.bgRed.white.bold(` ERROR `), chalk.redBright(msg))
};

const askQuestion = readlineSync;
let usarCodigo = false;
let numero = "";
const msgStore = new Map();
const msgLimit = 500;
let bootTime = Date.now();
let botReady = false;
let isRestarting = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let isUsingFallback = false;

const DIGITS = (s = "") => String(s).replace(/\D/g, "");

function normalizePhoneForPairing(input) {
  let s = DIGITS(input);
  if (!s) return "";
  if (s.startsWith("0")) s = s.replace(/^0+/, "");
  if (s.length === 10 && s.startsWith("3")) s = "57" + s;
  if (s.startsWith("52") && !s.startsWith("521") && s.length >= 12) s = "521" + s.slice(2);
  if (s.startsWith("54") && !s.startsWith("549") && s.length >= 11) s = "549" + s.slice(2);
  return s;
}

async function initData() {
  try {
    database.initDB();
    database.clearCache('user');
    database.clearCache('chat');
    database.clearCache('set');
    database.clearCache('chatuser');
    database.clearCache('packsticker');
    log.info('Base de datos inicializada.');
  } catch (e) {
    log.error(`Error DB: ${e.message}`);
  }
}

console.log(chalk.blue.bold('\n INICIANDO SISTEMA ...'));
console.log(chalk.cyan(`
      Alya | Wa Bot
     Powered by I'm Diego ~
`));

const BOT_TYPES = [
  { name: 'SubBot', folder: './Sessions/Subs', starter: startSubBot }
];

global.conns = global.conns || [];
const reconnectingSet = new Set();

async function loadBots() {
  for (const { name, folder, starter } of BOT_TYPES) {
    if (!fs.existsSync(folder)) continue;
    const botIds = fs.readdirSync(folder);
    for (const userId of botIds) {
      const sessionPath = path.join(folder, userId);
      const credsPath = path.join(sessionPath, 'creds.json');
      if (!fs.existsSync(credsPath)) continue;
      if (global.conns.some((conn) => conn.userId === userId)) continue;
      if (reconnectingSet.has(userId)) continue;

      try {
        reconnectingSet.add(userId);
        await starter(null, null, '', false, userId, '');
      } catch (e) {
        console.log(chalk.gray(`[ LOADBOTS ] Error ${name} ${userId}: ${e?.message || e}`));
        reconnectingSet.delete(userId);
      }
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
  setTimeout(loadBots, 60 * 1000);
}

function askConnectionMethod() {
  const ownerPath = './Sessions/Owner';
  const credsExist = fs.existsSync(path.join(ownerPath, 'creds.json'));

  if (credsExist) {
    log.info("Sesion encontrada. Intentando conectar...");
    return;
  }

  let lineM = '⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》';

  while (true) {
      const opcion = askQuestion.question(`╭${lineM}  
┊ ${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}
┊ ${chalk.blueBright('┊')} ${chalk.blue.bgBlue.bold.cyan('METODO DE VINCULACION')}
┊ ${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}   
┊ ${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}     
┊ ${chalk.blueBright('┊')} ${chalk.green.bgMagenta.bold.yellow('COMO DESEA CONECTARSE?')}
┊ ${chalk.blueBright('┊')} ${chalk.bold.redBright('=>  Opcion 1:')} ${chalk.greenBright('Codigo QR.')}
┊ ${chalk.blueBright('┊')} ${chalk.bold.redBright('=>  Opcion 2:')} ${chalk.greenBright('Codigo de 8 digitos.')}
┊ ${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}
┊ ${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}     
┊ ${chalk.blueBright('┊')} ${chalk.italic.magenta('Escriba solo el numero de')}
┊ ${chalk.blueBright('┊')} ${chalk.italic.magenta('la opcion para conectarse.')}
┊ ${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')} 
╰${lineM}\n${chalk.bold.magentaBright('---> ')}`);

      if (opcion === "1") {
          usarCodigo = false;
          break;
      } else if (opcion === "2") {
          usarCodigo = true;
          console.log(chalk.bold.redBright(`\n\nIngrese el numero de WhatsApp.\n` +
            `${chalk.bold.yellowBright("Ejemplo: +57301******")}\n` +
            `${chalk.bold.magentaBright('---> ')} `));
          let phoneInput = askQuestion.question("");
          numero = normalizePhoneForPairing(phoneInput);
          break;
      } else {
          console.log(chalk.redBright("Opcion invalida. Debe elegir 1 o 2."));
      }
  }
}

async function warmupGroups(sock) {
  try {
    const allChats = Object.values(database.getChat());
    const chatIds = allChats.map(c => c.id).filter(id => typeof id === 'string' && id.endsWith('@g.us')).slice(0, 50)
    if (!chatIds.length) return;
    console.log(chalk.gray(`[ ✿ ] Precargando metadata de ${chatIds.length} grupos...`));
    const t = Date.now();
    const batches = [];
    for (let i = 0; i < chatIds.length; i += 10) batches.push(chatIds.slice(i, i + 10));
    await Promise.allSettled(batches.map((batch) =>
      Promise.allSettled(batch.map(async (id) => {
        try {
          const meta = await sock.groupMetadata(id);
          if (meta) setCachedMeta(id, meta);
        } catch {}
      }))
    ));
    console.log(chalk.gray(`[ ✿ ] Warmup completado en ${Date.now() - t}ms`));
  } catch (e) {
    console.log(chalk.gray(`[ ✿ ] warmupGroups -> ${e?.message || e}`));
  }
}

function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

function getBackupSession() {
  const priorities = [
    { type: 'Sub', folder: './Sessions/Subs' }
  ];

  for (const item of priorities) {
    if (!fs.existsSync(item.folder)) continue;
    const files = fs.readdirSync(item.folder).filter(f => {
      try {
        const stats = fs.statSync(path.join(item.folder, f));
        return stats.isDirectory() && fs.existsSync(path.join(item.folder, f, 'creds.json'));
      } catch {
        return false;
      }
    });

    if (files.length > 0) {
      files.sort((a, b) => {
         const statA = fs.statSync(path.join(item.folder, a));
         const statB = fs.statSync(path.join(item.folder, b));
         return statB.mtimeMs - statA.mtimeMs;
      });

      const bestUser = files[0];
      const sessionPath = path.join(item.folder, bestUser);
      return { userId: bestUser, path: sessionPath, type: item.type };
    }
  }
  return null;
}

async function startBot(fallbackInfo = null) {
  if (isRestarting && !fallbackInfo) return;

  if (fallbackInfo) {
      isUsingFallback = true;
  } else {
      isUsingFallback = false;
  }

  isRestarting = true;
  bootTime = Date.now();

  let authStatePath = `./Sessions/Owner`;

  if (fallbackInfo) {
    const ownerPath = './Sessions/Owner';
    log.warn(`SESION PRINCIPAL PERDIDA. Restaurando respaldo: ${fallbackInfo.userId} (${fallbackInfo.type})`);

    if (fs.existsSync(ownerPath)) {
        fs.rmSync(ownerPath, { recursive: true, force: true });
    }

    copyFolderSync(fallbackInfo.path, ownerPath);
    log.success(`Respaldo copiado a Sessions/Owner.`);
  }

  const credsPath = path.join(authStatePath, 'creds.json');
  if (!fs.existsSync(credsPath) && !fallbackInfo) {
      askConnectionMethod();
  }

  const { state, saveCreds } = await useMultiFileAuthState(authStatePath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    browser: Browsers.macOS('Chrome'),
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
    shouldIgnoreJid: (jid) => jid.endsWith('@broadcast'),
    keepAliveIntervalMs: 25_000,
    getMessage: async (key) => msgStore.get(key.remoteJid + ':' + key.id) ?? { conversation: '' },
  });

  global.sock = sock;
  sock.ev.on("creds.update", saveCreds);

  sock.sendText = (jid, text, quoted = "", options) => sock.sendMessage(jid, { text, ...options }, { quoted });

  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    }
    return jid;
  };

  if (!state.creds.registered && !isUsingFallback) {
      if (usarCodigo) {
        setTimeout(async () => {
          try {
            const pairing = await sock.requestPairingCode(numero, 'STBOT004');
            const codeBot = pairing?.match(/.{1,4}/g)?.join("-") || pairing;
            console.log(chalk.bold.white(chalk.bgMagenta(`[ ✿ ] CODIGO:`)), chalk.bold.white(codeBot));
          } catch (e) {
            log.error(`Error generando codigo: ${e.message}`);
            usarCodigo = false; 
          }
        }, 3000);
      }
  }

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (!botReady || type !== 'notify') return;
    for (const msg of messages) {
      if (msg?.message && msg?.key?.id) {
        const sid = msg.key.remoteJid + ':' + msg.key.id;
        msgStore.set(sid, msg.message);
        if (msgStore.size > msgLimit) msgStore.delete(msgStore.keys().next().value);
      }
      try {
        if (!msg?.message || msg.key?.remoteJid === "status@broadcast") continue;
        if ((msg.messageTimestamp * 1000) < bootTime - 15_000) continue;
        if (msg.message.ephemeralMessage) msg.message = msg.message.ephemeralMessage.message;
        const m = await smsg(sock, msg);
        if (typeof handler === 'function') handler(sock, m, messages).catch((err) => console.error('[ Handler ]', err));
      } catch (err) {
        console.error('Error Process:', err);
      }
    }
  });

  try { await events(sock, null); } catch (err) { console.log(chalk.gray(`[ EVENT ERROR ] -> ${err}`)); }

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect, isNewLogin } = update;

    if (qr && !usarCodigo && !isUsingFallback) {
      qrcode.generate(qr, { small: true });
      console.log(chalk.yellow('QR Actualizado. Escanea ahora.'));
    }

    if (isNewLogin) log.info("Nuevo dispositivo detectado / Sesion restaurada");

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode || 0;

      const isLoggedOut = [
          DisconnectReason.loggedOut, 
          DisconnectReason.forbidden, 
          DisconnectReason.multideviceMismatch,
          DisconnectReason.badSession,
          DisconnectReason.unauthorized
      ].includes(reason);

      if (isLoggedOut) {
        log.error(`SESION PRINCIPAL CERRADA DEFINITIVAMENTE (${reason}).`);

        if (isUsingFallback) {
             log.error("El respaldo tambien fallo. Apagando sistema.");
             process.exit(1);
             return;
        }

        log.warn("Buscando sesion de respaldo para convertir en Owner...");
        const backup = getBackupSession();

        if (backup) {
            log.success(`Respaldo encontrado: ${backup.userId} (${backup.type})`);

            setTimeout(async () => {
                try {
                    await startBot(backup);

                    setTimeout(async () => {
                        if (global.sock && global.sock.user) {
                            const ownerJid = global.sock.user.id.split(':')[0] + "@s.whatsapp.net";
                            const targetJid = global.owner && global.owner[0] ? global.owner[0] + "@s.whatsapp.net" : ownerJid;

                            const msg2 = `Bot Activo\n\nLa sesion principal murio.\nHe asumido el control como *${backup.type}*.`;
                            await global.sock.sendMessage(targetJid, { text: msg2 }).catch(() => {});
                        }
                    }, 5000);
                } catch (e) {
                    log.error("Fallo inicio con respaldo");
                    process.exit(1);
                }
            }, 2000);
            return;
        } else {
            log.error("No hay sesiones de respaldo disponibles. El bot se detendra.");
            process.exit(1);
            return;
        }
      }

      if (reason === DisconnectReason.connectionReplaced) {
        log.warn("Conexion reemplazada por otra instancia.");
        isRestarting = false;
        return;
      }

      reconnectAttempts++;
      if (reconnectAttempts > maxReconnectAttempts) {
        log.error(`Maximo de reintentos (${maxReconnectAttempts}) alcanzado. La conexion es inestable.`);
        reconnectAttempts = 0;
        isRestarting = false;
        return;
      }

      const delay = Math.min(2000 * reconnectAttempts, 15000);
      const reasonMessages = {
        [DisconnectReason.connectionLost]: "Conexion perdida.",
        [DisconnectReason.connectionClosed]: "Conexion cerrada.",
        [DisconnectReason.restartRequired]: "Reinicio requerido.",
        [DisconnectReason.timedOut]: "Tiempo agotado.",
        [DisconnectReason.badSession]: "Sesion inestable.",
      };

      log.warn(`${reasonMessages[reason] || `Desconexion (${reason})`} Reintentando en ${delay/1000}s... (${reconnectAttempts}/${maxReconnectAttempts})`);

      setTimeout(() => {
          isRestarting = false;
          startBot(null);
      }, delay);
    }

    if (connection == "open") {
     reconnectAttempts = 0; 
     isRestarting = false;

     if (isUsingFallback && fallbackInfo) {
        try {
            log.success(`Operando con sesion de respaldo (${fallbackInfo.type}).`);
        } catch (e) {
            log.error(`Error post-fallback: ${e.message}`);
        }
     }

     const userName = sock.user.name || "Desconocido";
     bootTime = Date.now();

     if (global.sock && global.sock.user) {
         const ownerBotId = global.sock.user.id.split(':')[0] + '@s.whatsapp.net';
         database.updateSettings(ownerBotId, 'type', isUsingFallback ? (fallbackInfo?.type || 'Owner') : 'Owner');
         database.updateSettings(ownerBotId, 'botmod', 0);
         database.updateSettings(ownerBotId, 'botprem', 0);
     }

     log.success(`Conectado exitosamente como: ${userName}`);

     if (!botReady) {
        botReady = true;
        warmupGroups(sock);
     }
    }
  });
}

(async () => {
    await initData();
    await cmdsLoader();
    loadBots();
    await startBot();
})();