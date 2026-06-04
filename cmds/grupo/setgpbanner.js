import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setgpbanner'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock }) => {
    const q = msg.quoted ? msg.quoted : msg
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/image/.test(mime))
      return msg.reply('《✤》 Te faltó la imagen para cambiar el perfil del grupo.')

    const img = await q.download()
    if (!img) return msg.reply('✎ No se pudo descargar la imagen.')

    try {
      await sock.updateProfilePicture(msg.chat, img)
      msg.reply('✐ La imagen del grupo se actualizó con éxito.')
    } catch {
      msg.reply(msgglobal)
    }
  },
};
