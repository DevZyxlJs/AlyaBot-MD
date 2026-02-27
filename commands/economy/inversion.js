const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['invertir', 'trading'],
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

    const user = chatData.users[senderId]
    const currency = botSettings.currency || 'Monedas'

    const cooldown = 10 * 60 * 1000
    const now = Date.now()
    const remaining = (user.tradeCooldown || 0) - now

    if (remaining > 0)
      return m.reply(`《✧》 Debes esperar *${msToTime(remaining)}* antes de invertir nuevamente.`)

    if (args.length !== 1)
      return m.reply(`《✧》 Debes ingresar una cantidad de ${currency} para invertir en el mercado.`)

    const amount = parseInt(args[0])

    if (isNaN(amount) || amount < 200)
      return m.reply(`《✧》 La cantidad mínima de ${currency} para invertir es de 200.`)

    if (user.coins < amount)
      return m.reply(`✎ No tienes suficientes *${currency}* para realizar la inversión.`)

    user.coins -= amount
    user.tradeCooldown = now + cooldown

    const tiempo = Math.floor(Math.random() * 60000) + 60000

    m.reply(`《✧》 Inversión iniciada con *¥${amount.toLocaleString()} ${currency}*. Analizando mercado...`)

    setTimeout(async () => {

      const multiplicador = Math.floor(Math.random() * 16)
      let recompensa = 0
      let mensaje = ''

      if (multiplicador >= 5) {
        recompensa = amount * multiplicador
        mensaje = `ꕥ Movimiento alcista x${multiplicador}. Ganancia total: *¥${recompensa.toLocaleString()} ${currency}*.`
      } else {
        recompensa = 0
        mensaje = `✎ La operación fue liquidada. Perdiste *¥${amount.toLocaleString()} ${currency}*.`
      }

      user.coins += recompensa

      await client.reply(chatId, mensaje, m, { mentions: [senderId] })

    }, tiempo)
  },
}