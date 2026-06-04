import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['newpack', 'newstickerpack'],
  category: 'stickers',
  run: async ({ msg, sock, args }) => {
    try {
      const settings = await getSettings(sock.user.id.split(':')[0] + '@s.whatsapp.net') || {}
      const userId = await getUser(msg.sender)
      const dev = userId.name || msg.pushName || 'Desconocido'
      const name = args.join(' ').trim()
      if (!name || name.length < 4 || name.length > 64) {
        return msg.reply('《✧》El nombre del paquete de stickers debe tener entre 4 y 64 caracteres.')
      }
      const stickerPackData = await getStickersPack(msg.sender)
      const packs = stickerPackData.packs || []
      if (packs.find(p => p.name.toLowerCase() === name.toLowerCase())) {
        return msg.reply('《✧》Ya tienes un paquete con ese nombre.')
      }
      const newPack = { id: Date.now().toString(), lastModified: Date.now().toString(), name, author: `S'ᴛᴇʟʟᴀʀ 🧠 Wᴀʙᴏᴛ`, desc: `Paquete de stickers creado por ${dev}`, stickers: [], spackpublic: 0 }
      packs.push(newPack)
      await updateStickersPack(msg.sender, 'packs', packs)
      msg.reply(`《✧》El paquete de stickers \`${name}\` ha sido creado exitosamente!
> Puedes agregar stickers respondiendo a uno usando */addsticker ${name}*!`)
    } catch (e) {
      msg.reply(msgglobal);
    }
  }
}
