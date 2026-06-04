import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['bot'],
  category: 'grupo',
  isAdmin: true,
  run: async ({ msg, sock, args }) => {
    const chat = await getChat(msg.chat)
    const estado = chat.bannedGrupo ?? 0
    const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net"
    const bot = await getSettings(botId)

    if (args[0] === 'off') {
      if (estado) return msg.reply('✿ El *Bot* ya estaba *desactivado* en este grupo.')
      chat.bannedGrupo = 1

   await updateChat(msg.chat, 'bannedGrupo', chat.bannedGrupo)
      return msg.reply(`✿ Has *Desactivado* a *${bot.namebot2}* en este grupo.`)
    }

    if (args[0] === 'on') {
      if (!estado) return msg.reply(`《✧》 *${bot.namebot2}* ya estaba *activado* en este grupo.`)
      chat.bannedGrupo = 0

   await updateChat(msg.chat, 'bannedGrupo', chat.bannedGrupo)
      return msg.reply(`✿ Has *Activado* a *${bot.namebot2}* en este grupo.`)
    }

    return msg.reply(
      `*✿ Estado de ${bot.namebot2} (｡•́‿•̀｡)*\n✐ *Actual ›* ${estado ? '✗ Desactivado' : '✓ Activado'}\n\n✎ Puedes cambiarlo con:\n> ● _Activar ›_ *bot on*\n> ● _Desactivar ›_ *bot off*`,
    )
  },
};
