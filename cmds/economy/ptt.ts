export default {
  command: ['ppt'],
  category: 'rpg',
  async run(sock, m, args, command, text, prefix) {
    const chatId = m.chat
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const monedas = botSettings.currency
    const chatData = await getChat(m.chat)

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(mess.comandooff)

    const user = await getChatUser(m.chat, m.sender)   

    const user2 = await getUser(m.sender)
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

   await updateChatUser(m.chat, m.sender, 'coins', user.coins)
  await updateUser(m.sender, 'exp', user2.exp)

      await sock.reply(
        chatId,
        `✿ Ganaste.\n\n> *Tu elección ›* ${userChoice}\n> *Bot eligió ›* ${botChoice}\n> *${monedas} ›* ¥${reward.toLocaleString()}\n> *Exp ›* ${exp}\n\n${dev}`,
        m
      )
    } else if (result === 'lose') {
      const total = user.coins + user.bank
      const actualLoss = Math.min(loss, total)

      if (user.coins >= actualLoss) {
        user.coins -= actualLoss

   await updateChatUser(m.chat, m.sender, 'coins', user.coins)
      } else {
        const remaining = actualLoss - user.coins
        user.coins = 0
        user.bank = Math.max(0, user.bank - remaining)

   await updateChatUser(m.chat, m.sender, 'coins', user.coins)
   await updateChatUser(m.chat, m.sender, 'bank', user.bank)
      }

      await sock.reply(
        chatId,
        `✿ Perdiste.\n\n> *Tu elección ›* ${userChoice}\n> *Bot eligió ›* ${botChoice}\n> *${monedas} ›* -¥${actualLoss.toLocaleString()}\n\n${dev}`,
        m
      )
    } else {
      user.coins += tieReward
      user2.exp += tieExp

   await updateChatUser(m.chat, m.sender, 'coins', user.coins)
   await updateUser(m.sender, 'exp', user2.exp)
      await sock.reply(
        chatId,
        `✿ Empate.\n\n> *Tu elección ›* ${userChoice}\n> *Bot eligió ›* ${botChoice}\n> *${monedas} ›* +¥${tieReward.toLocaleString()}\n> *Exp ›* +${tieExp}\n\n${dev}`,
        m
      )
    }
   
    user.pptCooldown = Date.now() + 10 * 60 * 1000 // 10 minutos
   await updateChatUser(m.chat, m.sender, 'pptCooldown', user.pptCooldown)
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