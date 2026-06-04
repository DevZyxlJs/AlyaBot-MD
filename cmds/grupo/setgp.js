import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setgpname'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, args }) => {
    const newName = args.join(' ').trim()

    if (!newName)
      return msg.reply('🍒 Por favor, ingrese el nuevo nombre que desea ponerle al grupo.')

    try {
      await sock.groupUpdateSubject(msg.chat, newName)
      msg.reply(`🌽 El nombre del grupo se modificó correctamente.`)
    } catch {
      msg.reply(msgglobal)
    }
  },
};
