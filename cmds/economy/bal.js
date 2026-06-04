import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

export default {
  command: ['balance', 'bal'],
  category: 'rpg',
    run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chatId = msg.chat
    const chatData = await getChat(msg.chat)
    const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net"
    const botSettings = await getSettings(botId)
    const monedas = botSettings.currency

    if (chatData.adminonly || !chatData.rpg)
      return msg.reply(mess.comandooff)

    const mentioned = msg.mentionedJid
    const who = mentioned.length > 0 ? mentioned[0] : (msg.quoted ? msg.quoted.sender : msg.sender)

    const user = await getChatUser(msg.chat, who)
    const user2 = await getUser(who)
    if (!user)
      return msg.reply(`「✿」 El usuario mencionado no está registrado en el bot.`)

    const total = (user.coins || 0) + (user.bank || 0)

    const bal = `*ꕥ Balance de ›* ${user2.name}

	➠ *${monedas}* : *¥${user.coins?.toLocaleString() || 0}*
	➠ *Banco* : *¥${user.bank?.toLocaleString() || 0}*
	➠ *Total* : *¥${total.toLocaleString()}*

> Para proteger tus *${monedas}*, depósitalas en el banco usando *${prefix}dep*`

    await sock.reply(msg.chat, bal, msg)
  }
};