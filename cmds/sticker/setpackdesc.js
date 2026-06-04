import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setstickerpackdesc', 'setpackdesc', 'packdesc'],
  category: 'stickers',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args.length) {
        return msg.reply('《✧》Especifica el nombre del paquete y la nueva descripción.')
      }
      const fullText = args.join(' ').trim()
      const parts = fullText.split(/\||•|\//)
      if (parts.length < 2) {
        return msg.reply('《✧》Especifica el nombre del paquete y la nueva descripción.\n> Ejemplo: */packdesc NombreDelPaquete | Nueva Descripción*')
      }
      const packName = parts[0].trim()
      const desc = parts[1].trim()
      if (!desc || desc.length === 0) {
        return msg.reply('《✧》La descripción no puede estar vacía.')
      }
      if (desc.length > 60) {
        return msg.reply('《✧》La descripción no puede tener más de 60 caracteres.')
      }
      const stickerPackData = await getStickersPack(msg.sender)
      const packs = stickerPackData.packs || []
      if (!packs || packs.length === 0) {
        return msg.reply('《✧》No tienes paquetes creados.')
      }
      const pack = packs.find(p => p.name.toLowerCase() === packName.toLowerCase())
      if (!pack) {
        return msg.reply(`《✧》No se encontró el paquete de stickers \`${packName}\`.`)
      }
      pack.desc = desc
      pack.lastModified = Date.now().toString()
      await updateStickersPack(msg.sender, 'packs', packs)      
      msg.reply(`❀ La descripción del paquete de stickers \`${pack.name}\` ha sido actualizada!`)
    } catch (e) {
      msg.reply(msgglobal)
    }
  }
}
