import ws from 'ws';
import moment from 'moment';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import gradient from 'gradient-string';
import seeCommands from './lib/system/commandLoader.js';
import initDB from './lib/system/initDB.js';
import level from './commands/level.js';
import antilink from './commands/antilink.js';
import { getGroupAdmins } from './lib/message.js';

seeCommands()

export default async (client, m) => {
  if (!m.message) return

const sender = m.sender 

  let body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply?.selectedRowId || m.message.templateButtonReplyMessage?.selectedId || ''

  initDB(m, client)
  antilink(client, m)

const from = m.key.remoteJid
const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net' || client.user.lid
const chat = global.db.data.chats[m.chat] || {}
const settings = global.db.data.settings[botJid] || {}  
const rawBotname = settings.namebot2 || 'Alya'
const tipo = settings.type || 'Sub'
const isValidBotname = /^[\w\s]+$/.test(rawBotname)
const namebot = isValidBotname ? rawBotname : 'Alya'
const shortForms = [namebot.charAt(0), namebot.split(" ")[0], tipo.split(" ")[0], namebot.split(" ")[0].slice(0, 2), namebot.split(" ")[0].slice(0, 3)]
const prefixes = shortForms.map(name => `${name}`)
prefixes.unshift(namebot)

let prefix
if (Array.isArray(settings.prefijo) || typeof settings.prefijo === 'string') {
const prefixArray = Array.isArray(settings.prefijo) ? settings.prefijo : [settings.prefijo]
prefix = new RegExp('^(' + prefixes.join('|') + ')?(' + prefixArray.map(p => p.replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&')).join('|') + ')', 'i')
} else if (settings.prefijo === true) {
prefix = new RegExp('^', 'i')
} else {
prefix = new RegExp('^(' + prefixes.join('|') + ')?', 'i')
}
const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
let pluginPrefix = client.prefix ? client.prefix : prefix
let matchs = pluginPrefix instanceof RegExp ? [[pluginPrefix.exec(m.text), pluginPrefix]] : Array.isArray(pluginPrefix) ? pluginPrefix.map(p => {
let regex = p instanceof RegExp ? p : new RegExp(strRegex(p))
return [regex.exec(m.text), regex]}) : typeof pluginPrefix === 'string' ? [[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]] : [[null, null]]
let match = matchs.find(p => p[0])

const tf = global.db.data.chats[from].users[m.sender] || {}
const to = new Date().toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-') 
if (!tf.stats) tf.stats = {}
if (!tf.stats[to]) tf.stats[to] = { msgs: 0, cmds: 0 }
tf.stats[to].msgs++

  if (!match) return

  let usedPrefix = (match[0] || [])[0] || ''
  let args = m.text.slice(usedPrefix.length).trim().split(" ")
  let command = (args.shift() || '').toLowerCase()

  const text = args.join(' ')

  const pushname = m.pushName || 'Sin nombre'

let groupMetadata = null
let groupAdmins = []
let groupName = ''

if (m.isGroup) {
  groupMetadata = await client.groupMetadata(m.chat).catch(() => null)
  groupName = groupMetadata?.subject || ''
  groupAdmins = groupMetadata?.participants.filter(p =>
    (p.admin === 'admin' || p.admin === 'superadmin')
  ) || []
}

const isBotAdmins = m.isGroup ? groupAdmins.some(p => p.phoneNumber === botJid || p.jid === botJid || p.id === botJid || p.lid === botJid ) : false

const isAdmins = m.isGroup ? groupAdmins.some(p => p.phoneNumber === sender || p.jid === sender || p.id === sender || p.lid === sender ) : false

  const fromprimary = global.db.data.chats[from];
  const consolePrimary = fromprimary.primaryBot;

  if (!consolePrimary || consolePrimary === client.user.id.split(':')[0] + '@s.whatsapp.net') {
console.log(`𝄢 · • —– ٠ ✤ ٠ —– • · · • —– ٠ ✤ ٠ —– • ·✧༄
❚ ▸ ${chalk.cyan('𝐁𝐎𝐓 ❱❱')} ${chalk.bgMagenta(chalk.white.italic(client.user.id))}
❚ ▸ ${chalk.cyan('𝐇𝐎𝐑𝐀𝐑𝐈𝐎 ❱❱')} ${chalk.black.bgWhite(moment().format('DD/MM/YY HH:mm:ss'))}
❚ ${chalk.magentaBright('°o.OO.o°°o.OO.o°°o.OO.o°')}
❚ ▸ ${chalk.green('𝐔𝐒𝐔𝐀𝐑𝐈𝐎 ❱❱')} ${chalk.white(pushname)}
❚ ▸ ${chalk.green('𝐆𝐑𝐔𝐏𝐎 ❱❱')} ${chalk.cyan(m.isGroup ? groupName : 'Chat Privado')}
❚ ▸ ${chalk.green('𝐈𝐃 ❱❱')} ${chalk.cyan(m.isGroup ? from : 'Chat Privado')}
𝄢 · • —– ٠ ✤ ٠ —– • · · • —– ٠ ✤ ٠ —– • ·✧༄`)  
}

const hasPrefix = settings.prefijo === true ? true : (Array.isArray(settings.prefijo) ? settings.prefijo : typeof settings.prefijo === 'string' ? [settings.prefijo] : []).some(p => m.text?.startsWith(p))

function getAllSessionBots() {
  const sessionDirs = ['./Sessions/Subs', './Sessions/Mods', './Sessions/Prems']
  let bots = []
  for (const dir of sessionDirs) {
    try {
      const subDirs = fs.readdirSync(path.resolve(dir))
      for (const sub of subDirs) {
        const credsPath = path.resolve(dir, sub, 'creds.json')
        if (fs.existsSync(credsPath)) {
          bots.push(sub + '@s.whatsapp.net')
        }
      }
    } catch {}
  }
  try {
    const ownerCreds = path.resolve('./Sessions/Owner/creds.json')
    if (fs.existsSync(ownerCreds)) {
      const ownerId = global.client.user.id.split(':')[0] + '@s.whatsapp.net'
      bots.push(ownerId)
    }
  } catch {}
  return bots
}

const chatData = global.db.data.chats[m.chat]
const botprimaryId = chatData?.primaryBot
const selfId = client.user.id.split(':')[0] + '@s.whatsapp.net'

if (botprimaryId && botprimaryId !== selfId) {
  if (hasPrefix) {
    const participants = m.isGroup
      ? (await client.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants
      : []
    const primaryInGroup = participants.some(p =>
      (p.phoneNumber || p.id) === botprimaryId
    )
    const isPrimarySelf = botprimaryId === selfId
    const primaryInSessions = getAllSessionBots().includes(botprimaryId)
    if (!primaryInSessions || !primaryInGroup) {
      return
    }
    if ((primaryInSessions && primaryInGroup) || isPrimarySelf) {
      return
    }
  }
}

  const isVotOwn = [
    client.user.id.split(':')[0] + '@s.whatsapp.net',
    ...global.owner.map(num => num + '@s.whatsapp.net')
  ].includes(sender)

  if (global.db.data.settings[selfId].self) {
    const owner = global.db.data.settings[selfId].owner
    if (
      sender !== owner &&
      !isVotOwn &&
      !global.mods.map(num => num + '@s.whatsapp.net').includes(sender)
    ) return
  }

    if (m.chat && !m.chat.endsWith('g.us')) {
    const allowedInPrivateForUsers = ['report', 'reporte', 'sug', 'suggest', 'invite', 'invitar', 'setusername', 'setpfp', 'setimage', 'setstatus', 'reload', 'setname', 'setbotname', 'setmenubanner', 'setbanner', 'setbotcurrency', 'setbotchannel', 'setchannel', 'setbotowner', 'setlink', 'setbotlink', 'setbotprefix', 'seticon']
    const owners = global.db.data.settings[selfId].owner
    if (
      sender !== owners &&
      !global.owner.map(num => num + '@s.whatsapp.net').includes(sender) &&
      !allowedInPrivateForUsers.includes(command)
    ) return
  }

  if (chat?.bannedGrupo && !['#bot on', '/bot on', '.bot on', '!bot on', '-bot on', '+bot on'].includes(body.toLowerCase()) &&
      !global.owner.map(num => num + '@s.whatsapp.net').includes(m.sender)) return

  if (chat.adminonly && !isAdmins) return

if ((m.id.startsWith("3EB0") || (m.id.startsWith("BAE5") && m.id.length === 16) || (m.id.startsWith("B24E") && m.id.length === 20))) return

    const user = global.db.data.chats[m.chat].users[m.sender] || {}

const today = new Date().toLocaleDateString('es-CO', { 
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).split('/').reverse().join('-') 

if (!user.stats) user.stats = {}
if (!user.stats[today]) user.stats[today] = { msgs: 0, cmds: 0 }

// user.stats[today].msgs++

    const cmdData = global.comandos.get(command)

    if (!cmdData) {
    if (settings.prefijo === true) return
    await client.readMessages([m.key])
    return m.reply(`ꕤ El comando *${command}* no existe.\n✎ Usa *${usedPrefix}help* para ver la lista de comandos disponibles.`)
   }
    const comando = m.text.slice(usedPrefix.length);
    if (cmdData.isOwner && !global.owner.map(num => num + '@s.whatsapp.net').includes(sender)) {

  if (settings.prefijo === true) return
   return m.reply(`ꕤ El comando *${command}* no existe.\n✎ Usa *${usedPrefix}help* para ver la lista de comandos disponibles.`)
    }
    if (cmdData.isModeration && !global.mods.map(num => num + '@s.whatsapp.net').includes(sender)) {
 if (settings.prefijo === true) return
 return m.reply(`ꕤ El comando *${command}* no existe.\n✎ Usa *${usedPrefix}help* para ver la lista de comandos disponibles.`)
  }
    if (cmdData.isAdmin && !isAdmins) return client.reply(m.chat, mess.admin, m)
    if (cmdData.botAdmin && !isBotAdmins) return client.reply(m.chat, mess.botAdmin, m)

    try {
    await client.readMessages([m.key])
    const user2 = global.db.data.users[m.sender] || {}
    const bot = global.db.data.settings[client.user.id.split(':')[0] + "@s.whatsapp.net"] || {}

    user2.usedcommands = (user2.usedcommands || 0) + 1

    bot.commandsejecut = (bot.commandsejecut || 0) + 1
    user.usedTime = new Date()
    user2.exp = (user2.exp || 0) + Math.floor(Math.random() * 100)
    user2.name = m.pushName

    user.stats[today].cmds++

      await cmdData.run(client, m, args, command, text, usedPrefix)
    } catch (error) {
      return m.reply('[Error: *TypeError*] fetch failed')
    }
   level(m)
};
