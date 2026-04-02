import ws from 'ws';
import moment from 'moment';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import gradient from 'gradient-string';
import seeCommands from './core/system/commandLoader.ts';
import level from './cmds/level.ts';
import antilink from './cmds/antilink.ts';
import antistatus from './cmds/antistatus.ts';
import { getGroupAdmins } from './core/message.ts';

seeCommands()

export default async (client, m) => {

const sender = m.sender 

let body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply?.selectedRowId || m.message.templateButtonReplyMessage?.selectedId || ''

antilink(client, m)
antistatus(client, m)

const from = m.key.remoteJid
const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net' || client.user.lid
const chat = await getChat(m.chat)
const settings = await getSettings(botJid)  
const rawBotname = settings.namebot2 || 'Alya'
const tipo = settings.type || 'Sub'
const cleanBotname = rawBotname.replace(/[^a-zA-Z0-9\s]/g, '')
const namebot = cleanBotname || 'Alya'
const shortForms = [namebot.charAt(0), namebot.split(" ")[0], tipo.split(" ")[0], namebot.split(" ")[0].slice(0, 2), namebot.split(" ")[0].slice(0, 3)]
const prefixes = shortForms.map(name => `${name}`)
prefixes.unshift(namebot)

let prefix
if (Array.isArray(settings.prefijo) || typeof settings.prefijo === 'string') {
const prefixArray = Array.isArray(settings.prefijo) ? settings.prefijo : [settings.prefijo]
prefix = new RegExp('^(' + prefixes.join('|') + ')?(' + prefixArray.map(p => p.replace(/[|\\{}()[\]^$+*.\-\^`]/g, '\\$&')).join('|') + ')', 'i')
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

const tf = await getChatUser(m.chat, m.sender)
const to = new Date().toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-') 
if (!tf.stats) tf.stats = {}
if (!tf.stats[to]) tf.stats[to] = { msgs: 0, cmds: 0 }
tf.stats[to].msgs++

await updateChatUser(m.chat, m.sender, 'stats', tf.stats)

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

const fromprimary = await getChat(from)
const consolePrimary = fromprimary.primaryBot;

if (m.message || !consolePrimary || consolePrimary === global.botJid) {
console.log(`
${chalk.hex('#FE0041').bold('┈──────────────── ꒰ 🌺 ꒱')}
≡ 🌿  Username Bot :: ${chalk.cyan(client.user.name)}   
≡ 🎍  Horario :: ${chalk.redBright(moment().format('DD/MM/YY HH:mm:ss'))}  
≡ 🌲  User :: ${chalk.blueBright(pushname)}  
≡ 🌷  From :: ${chalk.green(m.isGroup ? 'Grupo' : 'Chat Private')}  
≡ 🌾  Comando :: ${chalk.magentaBright(command ? command : 'No Command')}
${chalk.hex('#FE0041').bold('┈──────────────── ꒰ 🍂 CDM : ꒱')}`)
}

const hasPrefix = settings.prefijo === true ? true : (Array.isArray(settings.prefijo) ? settings.prefijo : typeof settings.prefijo === 'string' ? [settings.prefijo] : []).some(p => m.text?.startsWith(p))

function getAllSessionBots() {
  const sessionDirs = ['./Sessions/Subs']
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

const chatData = await getChat(m.chat)
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

if (settings.self) {
  const owner = settings.owner
  if (
    sender !== owner &&
    !isVotOwn
  ) return
}

if (m.chat && !m.chat.endsWith('g.us')) {
  const allowedInPrivateForUsers = ['report', 'reporte', 'sug', 'suggest', 'invite', 'invitar', 'setusername', 'setpfp', 'setimage', 'setstatus', 'reload', 'setname', 'setbotname', 'setmenubanner', 'setbanner', 'setbotcurrency', 'setbotchannel', 'setchannel', 'setbotowner', 'setlink', 'setbotlink', 'setbotprefix', 'seticon', 'code', 'qr']
  const owners = settings.owner
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

const user = await getChatUser(m.chat, m.sender)

const today = new Date().toLocaleDateString('es-CO', { 
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).split('/').reverse().join('-') 

if (!user.stats) user.stats = {}
if (!user.stats[today]) user.stats[today] = { msgs: 0, cmds: 0 }

const cmdData = global.comandos.get(command)

if (!cmdData) {
  if (settings.prefijo === 1) return
  await client.readMessages([m.key])
  return m.reply(`ꕤ El comando *${command}* no existe.\n✎ Usa *${usedPrefix}help* para ver la lista de comandos disponibles.`)
}

const comando = m.text.slice(usedPrefix.length)

if (cmdData.isOwner && !global.owner.map(num => num + '@s.whatsapp.net').includes(sender)) {
  return m.reply(`ꕤ El comando *${command}* no existe.\n✎ Usa *${usedPrefix}help* para ver la lista de comandos disponibles.`)
}

if (cmdData.isAdmin && !isAdmins) return client.reply(m.chat, mess.admin, m)
if (cmdData.botAdmin && !isBotAdmins) return client.reply(m.chat, mess.botAdmin, m)

try {
  await client.readMessages([m.key])
  const user2 = await getUser(m.sender)

  user2.usedcommands = (user2.usedcommands || 0) + 1
  settings.commandsejecut = (settings.commandsejecut || 0) + 1
  user.usedTime = new Date()
  user2.exp = (user2.exp || 0) + Math.floor(Math.random() * 100)
  user2.name = m.pushName

  await updateChatUser(m.chat, m.sender, 'usedTime', user.usedTime)
  await updateUser(m.sender, 'exp', user2.exp)
  await updateUser(m.sender, 'name', user2.name)
  await updateUser(m.sender, 'usedcommands', user2.usedcommands)
  await updateSettings(botJid, 'commandsejecut', settings.commandsejecut)

  user.stats[today].cmds++
  await updateChatUser(m.chat, m.sender, 'stats', user.stats)

  await cmdData.run(client, m, args, command, text, usedPrefix)
} catch (error) {
  return m.reply(`${error}`)
}

level(m)
};