import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['withdraw', 'with'],
  category: 'rpg',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    const senderId = msg.sender
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const chatData = await getChat(msg.chat)

    if (chatData.adminonly || !chatData.rpg)
      return msg.reply(mess.comandooff)

    const user = await getChatUser(msg.chat, msg.sender)
    const currency = botSettings.currency || 'Monedas'

    if (!args[0]) return msg.reply(`《✤》 Ingresa la cantidad de *${currency}* que quieras retirar.`)

    if (args[0].toLowerCase() === 'all') {
      if ((user.bank || 0) <= 0)
        return msg.reply(`✐ No tienes *${currency}* para retirar de tu Banco.`)

      const amount = user.bank
      user.bank = 0
      user.coins = (user.coins || 0) + amount

   await updateChatUser(msg.chat, msg.sender, 'bank', user.bank)
   await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)

      return msg.reply(`✐ Has retirado *¥${amount.toLocaleString()} ${currency}* de tu Banco.`)
    }

    const count = parseInt(args[0])
    if (isNaN(count) || count < 1) return msg.reply(`✎ Ingresa una cantidad válida para retirar.`)

    if ((user.bank || 0) < count)
      return msg.reply(
        `✐ No tienes suficientes *${currency}* en tu banco para retirar esa cantidad.`,
      )

    user.bank -= count
    user.coins = (user.coins || 0) + count

   await updateChatUser(msg.chat, msg.sender, 'bank', user.bank)
   await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)

    await msg.reply(`✐ Has retirado *¥${count.toLocaleString()} ${currency}* de tu Banco.`)
  },
};
