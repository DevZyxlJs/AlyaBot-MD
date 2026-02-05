export default {
  command: ['monthly', 'mensual'],
  category: 'rpg',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const monedas = botSettings.currency
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`🌱 Estos comandos estan desactivados en este grupo.`)

    const user = chatData.users[m.sender]
    const coins = pickRandom([500, 1000, 1500, 2000, 2500])
    const exp = Math.floor(Math.random() * 5000)

    const monthlyCooldown = 30 * 24 * 60 * 60 * 1000 // 30 días
    const lastMonthly = user.lastMonthly || 0
    const tiempoRestante = msToTime(monthlyCooldown - (Date.now() - lastMonthly))

    if (Date.now() - lastMonthly < monthlyCooldown)
      return m.reply(
        `🍒 Debes esperar ${tiempoRestante} para volver a reclamar tu recompensa mensual.`,
      )

    user.lastMonthly = Date.now()
    user.exp += exp
    user.coins += coins

    const info = `☆ ໌　۟　𝖱𝖾𝖼𝗈𝗆𝗉𝖾𝗇𝗌𝖺　ׅ　팅화　ׄ

> 𖣣ֶㅤ֯⌗ 🚩̷  ׄ ⬭ *Exp ›* ${exp}
> 𖣣ֶㅤ֯⌗ 🪙̷  ׄ ⬭ *${monedas} ›* ${coins}

${dev}`

    // await m.reply(info)

    await client.sendContextInfoIndex(m.chat, info, {}, m, true, {})
  },
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function msToTime(duration) {
  let milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
    days = Math.floor(duration / (1000 * 60 * 60 * 24))

  days = days < 10 ? '0' + days : days
  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  return `${days} d ${hours} h ${minutes} m y ${seconds} s`
}
