import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

export default {
  command: ['delwarn'],
  category: 'group',
  isAdmin: true,
  run: async ({ msg, sock, args }) => {
    const chat = await getChat(msg.chat)
    const mentioned = msg.mentionedJid || []
    const targetId = mentioned.length > 0 ? mentioned[0] : (msg.quoted ? msg.quoted.sender : false)

    if (!targetId) return msg.reply('《✤》 Debes mencionar o responder al usuario cuya advertencia deseas eliminar.')

    const user = await getChatUser(msg.chat, targetId)
    const nam = await getUser(targetId)
    if (!user) return msg.reply('✎ No se encontró al usuario en la base de datos.')

    const total = user?.warnings?.length || 0
    if (total === 0) {
      return sock.reply(
        msg.chat,
        `✐ El usuario @${targetId.split('@')[0]} no tiene advertencias registradas.`,
        msg,
        { mentions: [targetId] }
      )
    }

    const name = nam.name || 'Usuario'

    const rawIndex = mentioned.length > 0 ? args[1] : args[0]

    if (rawIndex?.toLowerCase() === 'all') {
    //  user.warnings = []
      await updateChatUser(msg.chat, targetId, 'warnings', '[]')
      return sock.reply(
        msg.chat,
        `✎ Se han eliminado todas las advertencias del usuario @${targetId.split('@')[0]} (${name}).`,
        msg,
        { mentions: [targetId] }
      )
    }

    const index = parseInt(rawIndex)
    if (isNaN(index)) {
      return msg.reply('✐ Debes especificar el índice de la advertencia que deseas eliminar o usar all para borrar todas.')
    }

    if (index < 1 || index > total) {
      return msg.reply(`ꕥ El índice debe ser un número entre 1 y ${total}.`)
    }

    const realIndex = total - index
   // user.warnings.splice(realIndex, 1)
    await updateChatUser(msg.chat, targetId, 'warnings', user.warnings.splice(realIndex, 1))

    await sock.reply(
      msg.chat,
      `✎ Se ha eliminado la advertencia #${index} del usuario @${targetId.split('@')[0]} (${name}).`,
      msg,
      { mentions: [targetId] }
    )
  },
}