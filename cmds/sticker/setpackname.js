import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setstickerpackname', 'setpackname', 'packname'],
  category: 'stickers',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      if (!args.length) {
        return msg.reply(`《✧》Especifica el nombre del paquete y el nuevo nombre.\n> Ejemplo: *${prefix + command} NombreActual | NuevoNombre*`)
      }
      const fullText = args.join(' ').trim()
      const parts = fullText.split(/\||•|\//)
      if (parts.length < 2) {
        return msg.reply(`《✧》Especifica el nombre del paquete y el nuevo nombre.\n> Ejemplo: *${prefix + command} NombreActual | NuevoNombre*`)
      }
      const packName = parts[0].trim()
      const newName = parts[1].trim()
      if (!newName || newName.length === 0) {
        return msg.reply('《✧》El nuevo nombre no puede estar vacío.')
      }
      if (newName.length < 4 || newName.length > 64) {
        return msg.reply('《✧》El nuevo nombre debe tener entre 4 y 64 caracteres.')
      }
      const stickerPackData = await getStickersPack(msg.sender)
      const packs = stickerPackData.packs || []
      if (!packs || packs.length === 0) {
        return msg.reply('《✧》No tienes paquetes creados.')
      }
      if (packs.find(p => p.name.toLowerCase() === newName.toLowerCase())) {
        return msg.reply('《✧》Ya tienes un paquete con ese nombre.')
      }
      const pack = packs.find(p => p.name.toLowerCase() === packName.toLowerCase())
      if (!pack) {
        return msg.reply(`《✧》No se encontró el paquete de stickers \`${packName}\`.`)
      }
      pack.name = newName
      pack.lastModified = Date.now().toString()
      await updateStickersPack(msg.sender, 'packs', packs)
      msg.reply(`❀ El paquete de stickers \`${packName}\` ahora se llama \`${newName}\`!`)
    } catch (e) {
      msg.reply(msgglobal);
    }
  }
}
