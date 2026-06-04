import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['economyboard', 'eboard', 'baltop'],
  category: 'rpg',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chatId = msg.chat
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const monedas = botSettings.currency

    const chatData = await getChat(msg.chat)
    const chatDataa = await getChatUser(msg.chat)
    if (chatData.adminonly || !chatData.rpg)
      return msg.reply(mess.comandooff)

    try {
      const users = []
   for (const data of chatDataa || []) {
  const total = (data.coins || 0) + (data.bank || 0)
  if (total >= 1000) {
    const user = await getUser(data.user_id) || {}
    const name = user.name || 'User' 
    users.push({ ...data, jid: data.user_id, name })
  }
}

      if (users.length === 0)
        return msg.reply(`ꕥ No hay usuarios en el grupo con más de 1,000 ${monedas}.`)

      const sorted = users.sort(
        (a, b) => (b.coins || 0) + (b.bank || 0) - ((a.coins || 0) + (a.bank || 0))
      )

      const page = parseInt(args[0]) || 1
      const pageSize = 10
      const totalPages = Math.ceil(sorted.length / pageSize)

      if (isNaN(page) || page < 1 || page > totalPages)
        return msg.reply(`《✧》 La página *${page}* no existe. Hay *${totalPages}* páginas.`)

      const start = (page - 1) * pageSize
      const end = start + pageSize

      let boardText = `*✩ EconomyBoard (✿◡‿◡)*\n\n`
      boardText += sorted
        .slice(start, end)
        .map(({ name, coins, bank }, i) => {
          const total = (coins || 0) + (bank || 0)
          return `✩ ${start + i + 1} › *${name}*\n     Total → *¥${total.toLocaleString()} ${monedas}*`
        })
        .join('\n')

      boardText += `\n\n> ⌦ Página *${page}* de *${totalPages}*`
      if (page < totalPages)
        boardText += `\n> Para ver la siguiente página › *${prefix + command} ${page + 1}*`

      await msg.reply(boardText)
    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}