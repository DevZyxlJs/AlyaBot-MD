import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const getBotsFromFolder = (folderName) => {
  const basePath = path.join(dirname, '../../Sessions', folderName)
  if (!fs.existsSync(basePath)) return []
  return fs
    .readdirSync(basePath)
    .filter((dir) => fs.existsSync(path.join(basePath, dir, 'creds.json')))
    .map((id) => id.replace(/\D/g, '') + '@s.whatsapp.net')
}

const getAllowedBots = (mainBotJid) => {
  const subs = getBotsFromFolder('Subs')
  const mods = getBotsFromFolder('Mods')
  const prems = getBotsFromFolder('Prems')
  return [...new Set([...subs, ...mods, ...prems, mainBotJid])]
}

export default {
  command: ['setprimary'],
  category: 'grupo',
  isAdmin: true,

  run: async ({ msg, sock, args }) => {
    try {
    const chat = await getChat(msg.chat)
      const mentioned = msg.mentionedJid
      const who = mentioned.length > 0 ? mentioned[0] : msg.quoted?.sender || false
      if (!who) {
        return sock.reply(msg.chat, `《✤》 Por favor menciona un bot para convertirlo en primario.`, msg)
      }
      const groupMetadata = msg.isGroup ? await sock.groupMetadata(msg.chat).catch(() => {}) : ''
      const groupParticipants = groupMetadata?.participants?.map((p) => p.phoneNumber || p.jid || p.id || p.lid) || []

      const mainBotJid = global.sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const allowedBots = getAllowedBots(mainBotJid)

      if (!allowedBots.includes(who)) {
        return sock.reply(msg.chat, `✿ El usuario mencionado no es una instancia de Sub-Bot.`, msg)
      }

      if (!groupParticipants.includes(who)) {
        return sock.reply(msg.chat, `《✧》 El bot mencionado no está presente en este grupo.`, msg)
      }

      if (chat.primaryBot === who) {
        return sock.reply(msg.chat, `✎ @${who.split('@')[0]} ya es el Bot principal del Grupo.`, msg, {
          mentions: [who],
        })
      }

      chat.primaryBot = who

   await updateChat(msg.chat, 'primaryBot', chat.primaryBot)
      await sock.reply(
        msg.chat,
        `✐ Se ha establecido a @${who.split('@')[0]} como bot primario de este grupo.\n> Ahora todos los comandos de este grupo serán ejecutados por @${who.split('@')[0]}.`,
        msg,
        { mentions: [who] },
      )
    } catch (e) {
      console.error(e)
      await msg.reply(msgglobal)
    }
  },
};