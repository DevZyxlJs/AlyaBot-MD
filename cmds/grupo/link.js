import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['link'],
  category: 'grupo',
  botAdmin: true,
  run: async ({ msg, sock }) => {
    try {
      const code = await sock.groupInviteCode(msg.chat)
      const link = `https://chat.whatsapp.com/${code}`
      await sock.reply(msg.chat, `${link}`, msg)
    } catch (e) {
      await sock.reply(msg.chat, msgglobal, msg)
    }
  },
};
