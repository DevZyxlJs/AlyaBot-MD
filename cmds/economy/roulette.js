import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

const weightedRandom = (colors, weights) => {
  const total = weights.reduce((a, b) => a + b, 0)
  const rand = Math.random() * total
  let sum = 0
  for (let i = 0; i < colors.length; i++) {
    sum += weights[i]
    if (rand <= sum) return colors[i]
  }
}

export default {
  command: ['rt', 'roulette', 'ruleta'],
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
    const cooldown = 5 * 60 * 1000
    const now = Date.now()
    const remaining = (user.rtCooldown || 0) - now
    const currency = botSettings.currency || 'Monedas'

    if (remaining > 0)
      return msg.reply(`《✧》 Debes esperar *${msToTime(remaining)}* antes de apostar nuevamente.`)

    if (args.length !== 2)
      return msg.reply(`《✧》 Debes ingresar una cantidad de ${currency} y apostar a un color.`)

    const amount = parseInt(args[0])
    const color = args[1].toLowerCase()
    const validColors = ['red', 'black', 'green']

    if (isNaN(amount) || amount < 200)
      return msg.reply(`《✧》 La cantidad mínima de ${currency} a apostar es 200.`)

    if (!validColors.includes(color))
      return msg.reply(`✎ Por favor, elige un color válido: ${validColors.join(', ')}.`)

    if (user.coins < amount)
      return msg.reply(`✎ No tienes suficientes *${currency}* para hacer esta apuesta.`)

    user.rtCooldown = now + cooldown
    await updateChatUser(msg.chat, msg.sender, 'rtCooldown', user.rtCooldown)

    const colorSettings = {
      red:    { weight: 45 },
      black:  { weight: 40 },
      green:  { weight: 38 }
    }

    const weights = validColors.map(c => colorSettings[c].weight)
    const resultColor = weightedRandom(validColors, weights)

    if (resultColor === color) {
      const multiplier = Math.floor(Math.random() * 2) + 2
      const reward = amount * multiplier
      user.coins += reward
      await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
      await sock.reply(
        chatId,
        `ꕥ La ruleta salió en *${resultColor}* y has ganado *¥${reward.toLocaleString()} ${currency}*.`,
        msg,
        { mentions: [senderId] }
      )
    } else {
      user.coins -= amount
      await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
      await sock.reply(
        chatId,
        `✎ La ruleta salió en *${resultColor}* y has perdido *¥${amount.toLocaleString()} ${currency}*.`,
        msg,
        { mentions: [senderId] }
      )
    }
  },
}