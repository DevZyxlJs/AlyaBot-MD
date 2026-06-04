import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['delpack'],
  category: 'stickers',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args.length) {
        return msg.reply('《✧》Especifica el nombre del paquete de stickers.')
      }
      const packName = args.join(' ').trim()
      const stickerPackData = await getStickersPack(msg.sender)
      const packs = stickerPackData.packs || []
      if (!packs || packs.length === 0) {
        return msg.reply('《✧》No tienes paquetes creados.')
      }
      const packIndex = packs.findIndex(p => p.name.toLowerCase() === packName.toLowerCase())
      if (packIndex === -1) {
        return msg.reply(`《✧》No se encontró el paquete de stickers \`${packName}\`.`)
      }
      const deletedPack = packs[packIndex]
      packs.splice(packIndex, 1)
      await updateStickersPack(msg.sender, 'packs', packs)      
      msg.reply(`❀ El paquete de stickers \`${deletedPack.name}\` ha sido eliminado.`)
    } catch (e) {
      msg.reply(msgglobal)
    }
  }
}