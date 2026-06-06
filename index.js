import "./settings.ts"
import handler from '#handler'
import events from '#events'
import web from '#webs'
import makeWASocket, { Browsers, makeCacheableSignalKeyStore, useMultiFileAuthState, fetchLatestBaileysVersion, jidDecode, DisconnectReason } from 'baileys'
import { Boom } from '@hapi/boom'
import pino from "pino"
import qrcode from "qrcode-terminal"
import chalk from "chalk"
import fs from "fs"
import path from "path"
import readlineSync from "readline-sync"
import cmdsLoader from '#cmdsloader'
import { smsg, setCachedMeta } from "#serialize"
import db from "#db"
import { startModBot } from '#cmds/socket/codemod'
import { startPremBot } from '#cmds/socket/codeprem'
import { startSubBot } from '#cmds/socket/subbot'

const log = {
  info: (msg) => console.log(chalk.bgBlue.white.bold(` INFO `), chalk.white(msg)),
  success: (msg) => console.log(chalk.bgGreen.white.bold(` SUCCESS `), chalk.greenBright(msg)),
  warn: (msg) => console.log(chalk.bgYellow.white.bold(` WARNING `), chalk.white(msg)),
  error: (msg) => console.log(chalk.bgRed.white.bold(` ERROR `), chalk.redBright(msg))
}

const askQuestion = readlineSync
let opcion, phoneInput;
let lineM = '⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》'
let phoneNumber = ""
const msgStore = new Map()
const msgLimit = 500
const methodCodeQR = process.argv.includes("--qr");
const methodCode = process.argv.includes("code");
let bootTime = Date.now()
let botReady = false
let isRestarting = false
let reconnectAttempts = 0
const maxReconnectAttempts = 5
let isUsingFallback = false

const DIGITS = (s = "") => String(s).replace(/\D/g, "")

function normalizePhone(input) {
  let s = DIGITS(input)
  if (!s) return ""
  if (s.startsWith("0")) s = s.replace(/^0+/, "")
  if (s.length === 10 && s.startsWith("3")) s = "57" + s
  if (s.startsWith("52") && !s.startsWith("521") && s.length >= 12) s = "521" + s.slice(2)
  if (s.startsWith("54") && !s.startsWith("549") && s.length >= 11) s = "549" + s.slice(2)
  return s
}

async function initData() {
  try {
    db.initDB()
    db.clearCache('user')
    db.clearCache('chat')
    db.clearCache('set')
    db.clearCache('chatuser')
    db.clearCache('packsticker')
    log.info('Base de datos inicializada.')
  } catch (e) {
    log.error(`Error DB: ${e.message}`)
  }
}

console.log(chalk.blue.bold('\n INICIANDO SISTEMA ...'))
console.log(chalk.cyan(`
      Stellar | Wa Bot
     Powered by I'm Diego ~
`))

const BOT_TYPES = [
  { name: 'ModBot', folder: './Sessions/Mods', starter: startModBot },
  { name: 'PremBot', folder: './Sessions/Prems', starter: startPremBot },
  { name: 'SubBot', folder: './Sessions/Subs', starter: startSubBot }
]

global.conns = global.conns || []
const reconnectingSet = new Set()

async function loadBots() {
  for (const { name, folder, starter } of BOT_TYPES) {
    if (!fs.existsSync(folder)) continue
    const botIds = fs.readdirSync(folder)
    for (const userId of botIds) {
      const sessionPath = path.join(folder, userId)
      const credsPath = path.join(sessionPath, 'creds.json')
      if (!fs.existsSync(credsPath)) continue
      if (global.conns.some((conn) => conn.userId === userId)) continue
      if (reconnectingSet.has(userId)) continue
      try {
        reconnectingSet.add(userId)
        await starter(null, null, '', false, userId, '')
      } catch (e) {
        console.log(chalk.gray(`[ LOADBOTS ] Error ${name} ${userId}: ${e?.message || e}`))
        reconnectingSet.delete(userId)
      }
      await new Promise((res) => setTimeout(res, 2000))
    }
  }
  // setTimeout(loadBots, 60 * 1000)
}

function askConnectionMethod() {
  const ownerPath = './Sessions/Owner'
  const credsExist = fs.existsSync(path.join(ownerPath, 'creds.json'))
  if (credsExist) {
    log.info("Sesion encontrada. Intentando conectar...")
    return
  }

if (methodCodeQR) {
  opcion = "1";
} else if (methodCode) {
  opcion = "2";
  if (!phoneNumber) {
    console.log(chalk.bold.redBright(`\nPor favor, Ingrese el número de WhatsApp.\n${chalk.bold.yellowBright("Ejemplo: +57301******")}\n${chalk.bold.magentaBright('---> ')}`));
    phoneInput = readlineSync.question("");
    phoneNumber = normalizePhone(phoneInput);
  }
} else if (!fs.existsSync("./Sessions/Owner/creds.json")) {
  opcion = readlineSync.question(`╭${lineM}  
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
  while (!/^[1-2]$/.test(opcion)) {
    console.log(chalk.bold.redBright(`No se permiten numeros que no sean 1 o 2, tampoco letras o símbolos especiales.`));
    opcion = readlineSync.question("--> ");
  }
  if (opcion === "2") {
    console.log(chalk.bold.redBright(`\nPor favor, Ingrese el número de WhatsApp.\n${chalk.bold.yellowBright("Ejemplo: +57301******")}\n${chalk.bold.magentaBright('---> ')}`));
    phoneInput = readlineSync.question("");
    phoneNumber = normalizePhone(phoneInput);
  }
}
}

async function warmupGroups(sock) {
  try {
    const allChats = Object.values(db.getChat());
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
    { type: 'Mod', folder: './Sessions/Mods' },
    { type: 'Prem', folder: './Sessions/Prems' },
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
  if (isRestarting && !fallbackInfo) return
  isRestarting = true
  bootTime = Date.now()
  let authStatePath = `./Sessions/Owner`
  if (fallbackInfo) {
    isUsingFallback = true
    const ownerPath = './Sessions/Owner'
    log.warn(`SESION PRINCIPAL PERDIDA. Restaurando respaldo: ${fallbackInfo.userId} (${fallbackInfo.type})`)
       copyFolderSync(fallbackInfo.path, ownerPath);
    log.success(`Respaldo copiado a Sessions/Owner.`)
  } else {
    isUsingFallback = false
  }
  const credsPath = path.join(authStatePath, 'creds.json')
  if (!fs.existsSync(credsPath) && !fallbackInfo) {
    askConnectionMethod()
  }
  const { state, saveCreds } = await useMultiFileAuthState(authStatePath)
  const { version } = await fetchLatestBaileysVersion()
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
    keepAliveIntervalMs: 25000,
    getMessage: async (key) => msgStore.get(key.remoteJid + ':' + key.id) ?? { conversation: '' },
  })

  global.sock = sock
  sock.ev.on("creds.update", saveCreds)

  sock.sendText = (jid, text, quoted = "", options) => sock.sendMessage(jid, { text, ...options }, { quoted })

  sock.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {}
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid
    }
    return jid
  }

  if (opcion === "2" && !state.creds.registered && !isUsingFallback) {
    setTimeout(async () => {
      try {
        if (!state.creds.registered) {
          const pairing = await sock.requestPairingCode(phoneNumber, 'STBOT004');
          const codeBot = pairing?.match(/.{1,4}/g)?.join("-") || pairing;
          console.log(chalk.bold.white(chalk.bgMagenta(`Código de emparejamiento:`)), chalk.bold.white(chalk.white(codeBot)));
        }
      } catch (err) {
        console.log(chalk.red("Error al generar código:"), err);
      }
    }, 3000);
  }

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (!botReady || type !== 'notify') return
    for (const msg of messages) {
      if (msg?.message && msg?.key?.id) {
        const sid = msg.key.remoteJid + ':' + msg.key.id
        msgStore.set(sid, msg.message)
        if (msgStore.size > msgLimit) msgStore.delete(msgStore.keys().next().value)
      }
      try {
        if (!msg?.message || msg.key?.remoteJid === "status@broadcast") continue
        if ((msg.messageTimestamp * 1000) < bootTime - 15000) continue
        if (msg.message.ephemeralMessage) msg.message = msg.message.ephemeralMessage.message
        const m = await smsg(sock, msg)
        if (typeof handler === 'function') handler(sock, m, messages).catch((err) => console.error('[ Handler ]', err))
      } catch (err) {
        console.error('Error Process:', err)
      }
    }
  })

  try { await events(sock, null) } catch (err) { console.log(chalk.gray(`[ EVENT ERROR ] -> ${err}`)) }

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect, isNewLogin, receivedPendingNotifications } = update

    if (qr != 0 && qr != undefined || methodCodeQR) {
      if (opcion == '1' || methodCodeQR) {
        console.log(chalk.green.bold("[ ✿ ] Escanea este código QR"));
        qrcode.generate(qr, { small: true });
      }
   }

    if (connection == "open") {
      web(sock)
      reconnectAttempts = 0
      isRestarting = false
      if (isUsingFallback && fallbackInfo) {
        log.success(`Operando con sesion de respaldo (${fallbackInfo.type}).`)
      }
      const userName = sock.user.name || "Desconocido"
      bootTime = Date.now()
      if (global?.sock) {
        const ownerBotId = global?.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net'
        db.updateSettings(ownerBotId, 'type', isUsingFallback ? (fallbackInfo?.type || 'Owner') : 'Owner')
      }
      log.success(`Conectado exitosamente como: ${userName}`)
      if (!botReady) {
        botReady = true
        warmupGroups(sock)
      }
  } 

let reason = new Boom(lastDisconnect?.error)?.output?.statusCode

if (connection === 'close') {
  if (reason === DisconnectReason.badSession) {
    log.info("Sesión inválida.")
  } else if (reason === DisconnectReason.connectionClosed) {
    log.error("Sesión cerrada.")
    if (isUsingFallback) {
      log.error("El respaldo también falló. Apagando sistema.")
      process.exit(1)
      return
    }
    log.warn("Buscando sesión de respaldo...")
    const backup = getBackupSession()
    if (backup) {
      log.success(`Respaldo encontrado: ${backup.userId} (${backup.type})`)
      setTimeout(async () => {
        try {
          await startBot(backup)
          setTimeout(async () => {
            if (global.sock && global.sock.user) {
              const ownerJid = global.sock.user.id.split(':')[0] + "@s.whatsapp.net"
              const targetJid = global.owner && global.owner[0] ? global.owner[0] + "@s.whatsapp.net" : ownerJid
              const msg2 = `Bot Activo\n\nLa sesión principal murió.\nHe asumido el control como *${backup.type}*.`
              await global.sock.sendMessage(targetJid, { text: msg2 }).catch(() => {})
            }
          }, 5000)
        } catch (e) {
          log.error("Falló inicio con respaldo")
          process.exit(1)
        }
      }, 2000)
      return
    } else {
      log.error("No hay sesiones de respaldo disponibles. El bot se detendrá.")
      process.exit(1)
      return
    }
  } else if (reason === DisconnectReason.connectionLost) {
    reconnectAttempts++
    const delay = Math.min(2000 * reconnectAttempts, 15000) 
    log.warn(`Conexión perdida, reconectando en ${delay/1000}s... (${reconnectAttempts}/${maxReconnectAttempts})`)
    setTimeout(async () => {
      await startBot()
    }, delay)

    if (reconnectAttempts >= maxReconnectAttempts) { 
      log.info("Máximo de reinicios alcanzado. Buscando respaldo...")
      if (isUsingFallback) {
        log.error("El respaldo también falló. Apagando sistema.")
        process.exit(1)
        return
      }
      log.warn("Buscando sesión de respaldo...")
      const backup = getBackupSession()
      if (backup) {
        log.success(`Respaldo encontrado: ${backup.userId} (${backup.type})`)
        setTimeout(async () => {
          try {
            await startBot(backup)
            setTimeout(async () => {
              if (global.sock && global.sock.user) {
                const ownerJid = global.sock.user.id.split(':')[0] + "@s.whatsapp.net"
                const targetJid = global.owner && global.owner[0] ? global.owner[0] + "@s.whatsapp.net" : ownerJid
                const msg2 = `Bot Activo\n\nLa sesión principal murió.\nHe asumido el control como *${backup.type}*.`
                await global.sock.sendMessage(targetJid, { text: msg2 }).catch(() => {})
              }
            }, 5000)
          } catch (e) {
            log.error("Falló inicio con respaldo")
            process.exit(1)
          }
        }, 2000)
        return
      } else {
        log.error("No hay sesiones de respaldo disponibles. El bot se detendrá.")
        process.exit(1)
        return
      }
    }
  } else if (reason === DisconnectReason.connectionReplaced) {
    log.warn(`Conexión reemplazada por otra instancia.\n→ Mi número: ${sock.user.id.split(':')[0]}`)
  } else if (reason === DisconnectReason.loggedOut) {
    log.error("Sesión cerrada.")
    if (isUsingFallback) {
      log.error("El respaldo también falló. Apagando sistema.")
      process.exit(1)
      return
    }
    log.warn("Buscando sesión de respaldo...")
    const backup = getBackupSession()
    if (backup) {
      log.success(`Respaldo encontrado: ${backup.userId} (${backup.type})`)
      setTimeout(async () => {
        try {
          await startBot(backup)
          setTimeout(async () => {
            if (global.sock && global.sock.user) {
              const ownerJid = global.sock.user.id.split(':')[0] + "@s.whatsapp.net"
              const targetJid = global.owner && global.owner[0] ? global.owner[0] + "@s.whatsapp.net" : ownerJid
              const msg2 = `Bot Activo\n\nLa sesión principal murió.\nHe asumido el control como *${backup.type}*.`
              await global.sock.sendMessage(targetJid, { text: msg2 }).catch(() => {})
            }
          }, 5000)
        } catch (e) {
          log.error("Falló inicio con respaldo")
          process.exit(1)
        }
      }, 2000)
      return
    } else {
      log.error("No hay sesiones de respaldo disponibles. El bot se detendrá.")
      process.exit(1)
      return
    }
  } else if (reason === DisconnectReason.restartRequired) {
    log.info("Reinicio requerido.")
    await startBot()
  } else if (reason === DisconnectReason.timedOut) {
    log.warn("Conexión expirada.")
  } else {
    log.error(`Desconexión (${reason}).`)
    const backup = getBackupSession()
    if (backup) {
      log.success(`Respaldo encontrado: ${backup.userId} (${backup.type})`)
      setTimeout(async () => {
        try {
          await startBot(backup)
        } catch (e) {
          log.error("Falló inicio con respaldo")
          process.exit(1)
        }
      }, 2000)
    }
  }
}

    if (isNewLogin) log.info("Nuevo dispositivo detectado / Sesion restaurada")
    if (receivedPendingNotifications === true) {
      log.info("Por favor espere aproximadamente 1 minuto...")
      sock.ev.flush()
    }
  })
}

;(async () => {
  await initData()
  await cmdsLoader()
  loadBots()
  await startBot()
})()