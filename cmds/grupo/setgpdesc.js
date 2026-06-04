import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setgpdesc'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, args }) => {
    const newDesc = args.join(' ').trim()
    if (!newDesc)
      return msg.reply('《✧》 Por favor, ingrese la nueva descripción que desea ponerle al grupo.')

    try {
      await sock.groupUpdateDescription(msg.chat, newDesc)
      msg.reply('✐ La descripción del grupo se modificó correctamente.')
    } catch {
      msg.reply(msgglobal)
    }
  },
};
