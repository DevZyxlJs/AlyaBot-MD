import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default {
  command: ['bots', 'sockets'],
  category: 'socket',
  run: async (client, m) => {
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const bot = await getSettings(botId)
    const from = m.key.remoteJid
    const groupMetadata = m.isGroup ? await client.groupMetadata(from).catch(() => {}) : ''
    const groupParticipants = groupMetadata?.participants?.map((p) => p.phoneNumber || p.jid || p.lid || p.id) || []

    const mainBotJid = global.client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isMainBotInGroup = groupParticipants.includes(mainBotJid)

    const basePath = path.join(dirname, '../../Sessions')
    const folders = {
      Subs: 'Subs',
    }

    const getBotsFromFolder = (folderName) => {
      const folderPath = path.join(basePath, folderName)
      if (!fs.existsSync(folderPath)) return []
      return fs
        .readdirSync(folderPath)
        .filter((dir) => {
          const credsPath = path.join(folderPath, dir, 'creds.json')
          return fs.existsSync(credsPath)
        })
        .map((id) => id.replace(/\D/g, '')) 
    }

    const subs = getBotsFromFolder(folders.Subs)

    const categorizedBots = { Owner: [], Sub: [] }
    const mentionedJid = []

    const formatBot = async (number, label) => {
      const jid = number + '@s.whatsapp.net'
      if (!groupParticipants.includes(jid)) return null
      mentionedJid.push(jid)
      const data = await getSettings(jid)
      const name = data?.namebot2 || 'Bot'
      const handle = `@${number}`
      return `- [${label} *${name}*] › ${handle}`
    }

    if (getSettings(mainBotJid)) {
      const name = (await getSettings(mainBotJid))?.namebot2
      const handle = `@${mainBotJid.split('@')[0]}`
      if (isMainBotInGroup) {
        mentionedJid.push(mainBotJid)
        categorizedBots.Owner.push(`- [Owner *${name}*] › ${handle}`)
      }
    }

    for (const num of subs) {
      const line = await formatBot(num, 'Sub')
      if (line) categorizedBots.Sub.push(line)
    }

    const totalCounts = {
      Owner: 1,
      Sub: subs.length,
    }

    const totalBots = totalCounts.Owner + totalCounts.Sub
    const totalInGroup =
      categorizedBots.Owner.length +
      categorizedBots.Sub.length

    let message = `ꕥ Números de Sockets activos *(${totalBots})*\n\n`
    message += `ੈ❖‧₊˚ Principales › *${totalCounts.Owner}*\n`
    message += `ੈ✿‧₊˚ Subs › *${totalCounts.Sub}*\n\n`
    message += `➭ *Bots en el grupo ›* ${totalInGroup}\n`

    for (const category of ['Owner', 'Sub']) {
      if (categorizedBots[category].length) {
        message += categorizedBots[category].join('\n') + '\n'
      }
    }

    await client.sendContextInfoIndex(m.chat, message, {}, m, true, mentionedJid)
  },
};