import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

export default {
  command: ['warn'],
  category: 'group',
  isAdmin: true,
  run: async ({ msg, sock, args }) => {
    const chat = await getChat(msg.chat)
    const mentioned = msg.mentionedJid
    const targetId = mentioned.length > 0
      ? mentioned[0]
      : msg.quoted
      ? msg.quoted.sender
      : false

    const reason = mentioned.length > 0
      ? args.slice(1).join(' ') || 'Sin razón.'
      : args.slice(0).join(' ') || 'Sin razón.'

    try {
      if (!targetId) return msg.reply('《✤》 Debes mencionar o responder al usuario que deseas advertir.')

      const user = await getChatUser(msg.chat, targetId)

      if (!user.warnings) user.warnings = []

      const now = new Date()
      const timestamp = now.toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      user.warnings.unshift({
        reason,
        timestamp,
        by: msg.sender,
      })

      await updateChatUser(msg.chat, targetId, 'warnings', user.warnings)

      const total = user.warnings.length

      const nam = await getUser(targetId)
      const name = nam.name || 'Usuario'
      const warningList = user.warnings
        .map((w, i) => {
          const index = total - i
          return `\`#${index}\` » ${w.reason}\n> » Fecha: ${w.timestamp}`
        })
        .join('\n')

      let message = `✐ Se ha añadido una advertencia a @${targetId.split('@')[0]}.\n✿ Advertencias totales \`(${total})\`:\n\n${warningList}`

      const warnLimit = chat.warnLimit || 3
      const expulsar = chat.expulsar === 1

      if (total >= warnLimit && expulsar) {
        try {
          await sock.groupParticipantsUpdate(msg.chat, [targetId], 'remove')
          
          const deleted = deletedb('user', targetId)
          const deletedChat = deletedb('chatuser', msg.chat, targetId)

          if (deleted || deletedChat) {
            message += `\n\n> ❖ El usuario ha alcanzado el límite de advertencias y fue expulsado del grupo.`
          } else {
            message += `\n\n> ❖ El usuario alcanzó el límite, pero no se pudo eliminar de la base de datos.`
          }
        } catch {
          message += `\n\n> ❖ El usuario alcanzó el límite, pero no se pudo expulsar automáticamente.`
        }
      } else if (total >= warnLimit && !expulsar) {
        message += `\n\n> ❖ El usuario ha alcanzado el límite de advertencias.`
      }

      await sock.reply(msg.chat, message, msg, { mentions: [targetId] })
    } catch (e) {
      console.error(e)
      msg.reply(msgglobal + e)
    }
  },
}
