import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setwarnlimit'],
  category: 'group',
  isAdmin: true,
    run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
    const chat = await getChat(msg.chat)
    const raw = args[0]
    const limit = parseInt(raw)

    if (isNaN(limit) || limit < 0 || limit > 10) {
      return msg.reply(
        `✐ El límite de advertencias debe ser un número entre \`1\` y \`10\`, o \`0\` para desactivar.\n` +
        `> Ejemplo 1 › *${prefix + command} 5*\n` +
        `> Ejemplo 2 › *${prefix + command} 0*\n\n` +
        `> Si usas \`0\`, se desactivará la función de eliminar usuarios al alcanzar el límite de advertencias.\n` +
        `❖ Estado actual: ${chat.expulsar ? `\`${chat.warnLimit}\` advertencias` : '`Desactivado`'}`
      )
    }

    if (limit === 0) {
      chat.warnLimit = 0
      chat.expulsar = 0

   await updateChat(msg.chat, 'warnLimit', chat.warnLimit)
   await updateChat(msg.chat, 'expulsar', chat.expulsar)
      return msg.reply(
        `《✤》 Has desactivado la función de eliminar usuarios al alcanzar el límite de advertencias.`
      )
    }

    chat.warnLimit = limit
    chat.expulsar = 1

   await updateChat(msg.chat, 'warnLimit', chat.warnLimit)
   await updateChat(msg.chat, 'expulsar', chat.expulsar)

    await msg.reply(
      `✐ Límite de advertencias establecido en \`${limit}\` para este grupo.\n` +
      `> ❖ Los usuarios serán eliminados automáticamente al alcanzar este límite.`
    )
  } catch (e) {
   msg.reply(msgglobal + e)
  }
  },
};