import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['dep', 'deposit', 'd'],
  category: 'rpg',
  run: async ({ msg, sock, args }) => {
    const chatData = await getChat(msg.chat)
    const user = await getChatUser(msg.chat, msg.sender)
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = await getSettings(idBot)
    const monedas = settings.currency

    if (chatData.adminonly || !chatData.rpg)
      return msg.reply(mess.comandooff)

    if (!args[0]) {
      return msg.reply(
        `《✤》 Ingresa la cantidad de *${monedas}* que quieras *depositar*.`,
      )
    }

    if (args[0] < 1 && args[0].toLowerCase() !== 'all') {
      return msg.reply('✐ Ingresa una cantidad *válida* para depositar')
    }

    if (args[0].toLowerCase() === 'all') {
      if (user.coins <= 0) return msg.reply(`✎ No tienes *${monedas}* para depositar en tu *banco*`)

      const count = user.coins
      user.coins = 0
      user.bank += count

   await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
   await updateChatUser(msg.chat, msg.sender, 'bank', user.bank)

      await msg.reply(`「✎」 Has depositado *¥${count.toLocaleString()} ${monedas}* en tu Banco`)
      return true
    }

    if (!Number(args[0]) || parseInt(args[0]) < 1) {
      return msg.reply('✐ Ingresa una cantidad *válida* para depositar')
    }

    const count = parseInt(args[0])
    if (user.coins <= 0 || user.coins < count) {
      return msg.reply('✎ No tienes suficientes *${monedas}* para depositar')
    }

    user.coins -= count
    user.bank += count

   await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
   await updateChatUser(msg.chat, msg.sender, 'bank', user.bank)
    await msg.reply(`「✿」 Has depositado *¥${count.toLocaleString()} ${monedas}* en tu Banco`)
  },
};
