import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['ping', 'p'],
  category: 'info',
  run: async ({ msg, sock }) => {
    const start = Date.now()
    const sent = await sock.sendMessage(msg.chat, { text: '`❏ ¡Pong!`' + `\n> *${await getSettings(sock.user.id.split(':')[0] + "@s.whatsapp.net").namebot}*`}, { quoted: msg })
    const latency = Date.now() - start

    await sock.sendMessage(msg.chat, {
      text: `✿ *Pong!*\n> Tiempo ⴵ ${latency}ms`,
      edit: sent.key
    }, { quoted: msg })
  },
};
