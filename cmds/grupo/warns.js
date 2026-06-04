import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

export default {
  command: ['warns'],
  category: 'group',
  isAdmin: true,
  run: async ({ msg, sock, args }) => {
    const chat = await getChat(msg.chat)
    const mentioned = msg.mentionedJid
    const userId =
      mentioned.length > 0
        ? mentioned[0]
        : msg.quoted
        ? msg.quoted.sender
        : false

    const user = await getChatUser(msg.chat, userId)
    const nam = await getUser(userId)

    if (!userId || !user) {
      return msg.reply('《✤》 Menciona o responde a un usuario válido para ver sus advertencias.')
    }

    const total = user.warnings?.length || 0

    if (total === 0) {
      return sock.reply(msg.chat, `✐ @${userId.split('@')[0]} no tiene advertencias registradas.`, msg, {
        mentions: [userId],
      })
    }

    const name = (nam.name) || 'Usuario'
    const warningList = user.warnings
      .map((w, i) => {
        const index = total - i
        const author = w.by ? `\n> » Por: @${w.by.split('@')[0]}` : ''
        return `\`#${index}\` » ${w.reason}\n> » Fecha: ${w.timestamp}${author}`
      })
      .join('\n')

    await sock.reply(msg.chat,
      `✐ Advertencias de @${userId.split('@')[0]} (${name}):\n> ✧ Total de advertencias: \`${total}\`\n\n${warningList}`,
      msg,
      { mentions: [userId, ...user.warnings.map(w => w.by).filter(Boolean)] }
    )
  },
};