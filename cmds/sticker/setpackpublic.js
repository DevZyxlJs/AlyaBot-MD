import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setpackpublic', 'setpackpub', 'packpublic'],
  category: 'stickers',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args.length) {
        return msg.reply('《✧》Debes especificar el nombre del paquete de stickers.')
      }
      const packName = args.join(' ').trim()
      const stickerPackData = await getStickersPack(msg.sender)
      const packs = stickerPackData.packs || []
      if (!packs || packs.length === 0) {
        return msg.reply('《✧》No tienes paquetes creados.')
      }
      const pack = packs.find(p => p.name.toLowerCase() === packName.toLowerCase())
      if (!pack) {
        return msg.reply(`《✧》No se encontró el paquete de stickers \`${packName}\`.`)
      }
      if (pack.spackpublic === 1) {
        return msg.reply(`《✧》El paquete de stickers \`${pack.name}\` ya es público.`)
      }
      pack.spackpublic = 1
      pack.lastModified = Date.now().toString()
      await updateStickersPack(msg.sender, 'packs', packs)      
      msg.reply(`❀ El paquete de stickers \`${pack.name}\` ha sido establecido como público!`)
    } catch (e) {
      msg.reply(msgglobal)
    }
  }
}