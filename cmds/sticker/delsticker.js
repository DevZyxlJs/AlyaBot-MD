import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['stickerdel', 'delsticker'],
  category: 'stickers',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args.length) {
        return msg.reply('《✧》Especifica el nombre del paquete.')
      }
      const packName = args.join(' ').trim()
      const stickerPackData = await getStickersPack(msg.sender)
      const packs = stickerPackData.packs || []
      if (!packs || packs.length === 0) {
        return msg.reply('《✧》No tienes paquetes creados.')
      }
      const pack = packs.find(p => p.name.toLowerCase() === packName.toLowerCase())
      if (!pack) {
        return msg.reply('《✧》No se encontró un paquete con ese nombre.')
      }
      const quoted = msg.quoted
      if (!quoted) {
        return msg.reply('《✧》Responde a un sticker para eliminarlo del paquete de stickers.')
      }
      const mime = quoted.mimetype || quoted.msg?.mimetype || ''
      if (!/webp/i.test(mime)) {
        return msg.reply('《✧》Solo puedes eliminar stickers.')
      }
      if (!pack.stickers || pack.stickers.length === 0) {
        return msg.reply('《✧》El paquete no tiene stickers.')
      }
      let buffer = await quoted.download()
      if (!buffer) {
        return msg.reply('《✧》No se pudo obtener el sticker.')
      }
      if (!Buffer.isBuffer(buffer)) {
        buffer = Buffer.from(buffer)
      }
      const base64Buffer = buffer.toString('base64')
      const index = pack.stickers.findIndex(stored => stored === base64Buffer)
      if (index === -1) {
        return msg.reply('《✧》Ese sticker no está en el paquete.')
      }
      pack.stickers.splice(index, 1)
      pack.lastModified = Date.now().toString()
      await updateStickersPack(msg.sender, 'packs', packs)
      msg.reply(`❀ El sticker ha sido eliminado del paquete de stickers ${pack.name}!`)
    } catch (e) {
      msg.reply(msgglobal)
    }
  }
}