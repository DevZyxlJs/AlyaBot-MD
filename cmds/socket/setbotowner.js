import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

export default {
  command: ['setbotowner'],
  category: 'socket',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot)
    const owner = config.owner ? config.owner : '' || ''
    const isOwner2 = [idBot, ...global.mods.map((number) => number + '@s.whatsapp.net')].includes(msg.sender)
    if (!isOwner2 && msg.sender !== owner) return msg.reply(mess.socket)
    const mentioned = msg.mentionedJid
    const who = mentioned.length > 0 ? mentioned[0] : (msg.quoted ? msg.quoted.sender : false)
    const menti = sock.user.id.split(':')[0] + "@s.whatsapp.net"
    if (!who) {
     return sock.reply(msg.chat, `✿ Debes mencionar al nuevo dueño del bot.\n> Ejemplo: *${prefix + command} @${menti.split('@')[0]}*`, msg, { mentions: [menti] })
    }

const anteriorOwner = config.owner
const esCambio = anteriorOwner && anteriorOwner.endsWith('@s.whatsapp.net')

config.owner = who

await updateSettings(idBot, 'owner', config.owner)

const mensaje = esCambio
  ? `✤ El dueño del bot ha sido cambiado de @${anteriorOwner.split('@')[0]} a @${who.split('@')[0]}!`
  : `✤ El nuevo dueño de *${config.namebot2}* es @${who.split('@')[0]}!`

return msg.reply(mensaje, {
  mentions: esCambio ? [anteriorOwner, who] : [who]
})
  },
};