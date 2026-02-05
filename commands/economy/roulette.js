const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['rt', 'roulette', 'ruleta'],
  category: 'rpg',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(mess.comandooff)

    const user = chatData.users[m.sender]
    const cooldown = 10 * 60 * 1000
    const now = Date.now()
    const remaining = (user.rtCooldown || 0) - now
    const currency = botSettings.currency || 'Monedas'

    if (remaining > 0)
      return m.reply(`《✧》 Debes esperar *${msToTime(remaining)}* antes de apostar nuevamente.`)

    if (args.length !== 2)
      return m.reply(`《✧》 Debes ingresar una cantidad de ${currency} y apostar a un color.`)

    const amount = parseInt(args[0])
    const color = args[1].toLowerCase()
    const validColors = ['red', 'black', 'green']

    if (isNaN(amount) || amount < 200)
      return m.reply(`《✧》 La cantidad mínima de ${currency} a apostar es 200.`)

    if (!validColors.includes(color))
      return m.reply(`✎ Por favor, elige un color válido: red, black, green.`)

    if (user.coins < amount)
      return m.reply(`✎ No tienes suficientes *${currency}* para hacer esta apuesta.`)

    user.rtCooldown = now + cooldown
    const resultColor = validColors[Math.floor(Math.random() * validColors.length)]

    if (resultColor === color) {
      const reward = amount * (resultColor === 'green' ? 14 : 2)
      user.coins += reward
      await client.reply(
        chatId,
        `ꕥ La ruleta salió en *${resultColor}* y has ganado *¥${reward.toLocaleString()} ${currency}*.`,
        m,
        { mentions: [senderId] }
      )
    } else {
      user.coins -= amount
      await client.reply(
        chatId,
        `✎ La ruleta salió en *${resultColor}* y has perdido *¥${amount.toLocaleString()} ${currency}*.`,
        m,
        { mentions: [senderId] }
      )
    }
  },
}