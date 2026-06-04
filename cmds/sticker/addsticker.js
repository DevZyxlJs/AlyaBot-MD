import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['addsticker', 'stickeradd'],
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
        return msg.reply('《✧》Responde a un sticker.')
      }
      const mime = quoted.mimetype || quoted.msg?.mimetype || ''
      if (!/webp/i.test(mime)) {
        return msg.reply('《✧》Solo puedes agregar stickers.')
      }
      if (pack.stickers.length >= 30) {
        return msg.reply('《✧》Un paquete no puede tener más de 30 stickers.')
      }
      let buffer = await quoted.download()
      if (!buffer) {
        return msg.reply('《✧》No se pudo descargar el sticker.')
      }
      if (!Buffer.isBuffer(buffer)) {
        buffer = Buffer.from(buffer)
      }
      if (buffer.length === 0) {
        return msg.reply('《✧》El sticker está vacío o corrupto.')
      }
      const base64Sticker = buffer.toString('base64')
      if (pack.stickers.includes(base64Sticker)) {
        return msg.reply(`《✧》El sticker ya existe en el paquete de stickers \`${pack.name}\`.`)
      }
      pack.stickers.push(base64Sticker)
      pack.lastModified = Date.now().toString()
      await updateStickersPack(msg.sender, 'packs', packs)
      msg.reply(`《✧》Sticker agregado al pack \`${pack.name}\` correctamente!`)
    } catch (e) {
      msg.reply(msgglobal)
    }
  }
}