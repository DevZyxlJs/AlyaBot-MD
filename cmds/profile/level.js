import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

export default {
  command: ['levelup', 'level', 'lvl'],
  category: 'profile',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    const mentioned = msg.mentionedJid
    const who = mentioned.length > 0 ? mentioned[0] : (msg.quoted ? msg.quoted.sender : msg.sender)

    const user = await getUser(who)     
    const allUsers = await getUser() || []    

    if (!user)
      return msg.reply(`「✎」 El usuario mencionado no está registrado en el bot.`)

    const users = allUsers.map(u => ({
      ...u,
      jid: u.id
    }))

    const sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0))
    const rank = sortedLevel.findIndex(u => u.jid === who) + 1

    const txt = `*❑ ˳Usuario* ◢ ${user.name || who.split('@')[0]} ◤

𖹭  ׄ  ְ ✿ Experiencia › *${user.exp?.toLocaleString() || 0}*
𖹭  ׄ  ְ ✤ Nivel › *${user.level || 0}*
𖹭  ׄ  ְ ❀ Puesto › *#${rank}*

𖹭  ׄ  ְ ☆ Comandos totales › *${user.usedcommands?.toLocaleString() || 0}*`

    await msg.reply(txt)
  }
}