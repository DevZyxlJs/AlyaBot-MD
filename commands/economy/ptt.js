export default {
  command: ['ppt'],
  category: 'rpg',
  run: async (client, m, args, command, text, prefix) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const monedas = botSettings.currency
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(mess.comandooff)

    const user = chatData.users[m.sender]

    const staminaConsumed = Math.floor(Math.random() * (5 - 1 + 1)) + 1

    if (user.stamina < staminaConsumed) {
      return m.reply(`✿ No tienes suficiente energía para ir a minar.\n> Usa *${prefix}heal* para curarte.`)
    }    

    const user2 = db.users[m.sender]
    const remainingTime = user.pptCooldown - Date.now()

    if (remainingTime > 0)
      return m.reply(`❀ Debes esperar *${msToTime(remainingTime)}* antes de jugar nuevamente.`)

    const options = ['piedra', 'papel', 'tijera']
    const userChoice = args[0]?.trim().toLowerCase()

    if (!options.includes(userChoice))
      return m.reply(`《✤》 Usa el comando así:\n› *${prefix + command} piedra*, *papel* o *tijera*`)

    const botChoice = options[Math.floor(Math.random() * options.length)]
    const result = determineWinner(userChoice, botChoice)

    const reward = Math.floor(Math.random() * 3000)
    const exp = Math.floor(Math.random() * 1000)
    const loss = Math.floor(Math.random() * 1000)
    const tieReward = Math.floor(Math.random() * 100)
    const tieExp = Math.floor(Math.random() * 100)

    if (result === 'win') {
      user.coins += reward
      user2.exp += exp
      await client.reply(
        chatId,
        `✿ Ganaste.\n\n> *Tu elección ›* ${userChoice}\n> *Bot eligió ›* ${botChoice}\n> *${monedas} ›* ¥${reward.toLocaleString()}\n> *Exp ›* ${exp}\n\n${dev}`,
        m
      )
    } else if (result === 'lose') {
      const total = user.coins + user.bank
      const actualLoss = Math.min(loss, total)

      if (user.coins >= actualLoss) {
        user.coins -= actualLoss
      } else {
        const remaining = actualLoss - user.coins
        user.coins = 0
        user.bank = Math.max(0, user.bank - remaining)
      }

      await client.reply(
        chatId,
        `✿ Perdiste.\n\n> *Tu elección ›* ${userChoice}\n> *Bot eligió ›* ${botChoice}\n> *${monedas} ›* -¥${actualLoss.toLocaleString()}\n\n${dev}`,
        m
      )
    } else {
      user.coins += tieReward
      user2.exp += tieExp
      await client.reply(
        chatId,
        `✿ Empate.\n\n> *Tu elección ›* ${userChoice}\n> *Bot eligió ›* ${botChoice}\n> *${monedas} ›* +¥${tieReward.toLocaleString()}\n> *Exp ›* +${tieExp}\n\n${dev}`,
        m
      )
    }

    user.stamina -= staminaConsumed    
    user.pptCooldown = Date.now() + 10 * 60 * 1000 // 10 minutos
  },
}

function determineWinner(user, bot) {
  if (user === bot) return 'tie'
  if (
    (user === 'piedra' && bot === 'tijera') ||
    (user === 'papel' && bot === 'piedra') ||
    (user === 'tijera' && bot === 'papel')
  )
    return 'win'
  return 'lose'
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  return `${minutes} minuto${minutes !== 1 ? 's' : ''}, ${seconds} segundo${seconds !== 1 ? 's' : ''}`
}