import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setbotname', 'setname'],
  category: 'socket',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot)
    const owner = config.owner ? config.owner : '' || ''
    const isOwner2 = [idBot, ...global.mods.map((number) => number + '@s.whatsapp.net')].includes(msg.sender)
    if (!isOwner2 && msg.sender !== owner) return msg.reply(mess.socket)
    const value = args.join(' ').trim()
    if (!value) return msg.reply(`✿ Debes escribir un nombre corto y un nombre largo valido.\n> Ejemplo: *${prefix + command} Sherry / Sherry Barnet*`)
    const formatted = value.replace(/\s*\/\s*/g, '/')
    let [short, long] = formatted.includes('/') ? formatted.split('/') : [value, value]
    if (!short || !long) return msg.reply('❀ Usa el formato: Nombre Corto / Nombre Largo')
    if (/\s/.test(short)) return msg.reply('❀ El nombre corto no puede contener espacios.')
    config.namebot2 = short.trim()
    config.namebot = long.trim()

   await updateSettings(idBot, 'namebot2', config.namebot2)
   await updateSettings(idBot, 'namebot', config.namebot)
    return msg.reply(`✤ El nombre del bot ha sido actualizado!\n\n❒ Nombre corto: *${short.trim()}*\n❒ Nombre largo: *${long.trim()}*`)
  },
};