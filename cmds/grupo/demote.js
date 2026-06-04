import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['demote'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock }) => {
    const mentioned = await msg.mentionedJid
    const who = mentioned.length > 0 ? mentioned[0] : msg.quoted ? await msg.quoted.sender : false

    if (!who) return msg.reply('《✤》 Menciona al usuario que deseas degradar de administrador.')

    try {
      const groupMetadata = await sock.groupMetadata(msg.chat)
      const participant = groupMetadata.participants.find(
        (p) =>
          p.phoneNumber === who ||
          p.id === who ||
          p.lid === who ||
          p.jid === who
      )

      if (!participant?.admin)
        return sock.reply(
          msg.chat,
          `✎ *@${who.split('@')[0]}* no es administrador del grupo!`,
          msg,
          { mentions: [who] }
        )

      if (who === groupMetadata.owner)
        return msg.reply('✿ No puedes degradar al creador del grupo de administrador.')

      if (who === sock.user.jid)
        return msg.reply('✿ No puedes degradar al bot de administrador.')

      await sock.groupParticipantsUpdate(msg.chat, [who], 'demote')
      await sock.reply(
        msg.chat,
        `✎ *@${who.split('@')[0]}* ha sido degradado de administrador del grupo!`,
        msg,
        { mentions: [who] }
      )
    } catch {
      await msg.reply(msgglobal)
    }
  },
}