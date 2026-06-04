import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['slut'],
  category: 'rpg',
    run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chatId = msg.chat
    const senderId = msg.sender
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const chatData = await getChat(msg.chat)

    if (chatData.adminonly || !chatData.rpg)
      return msg.reply(mess.comandooff)

    const user = await getChatUser(msg.chat, msg.sender)
    const cooldown = 10 * 60 * 1000
    const now = Date.now()
    const remaining = (user.slutCooldown || 0) - now
    const currency = botSettings.currency || 'Monedas'

    if (remaining > 0)
      return msg.reply(`ꕥ Debes esperar *${msToTime(remaining)}* antes de intentar nuevamente.`)

    const success = Math.random() < 0.5
    const amount = Math.floor(Math.random() * 5000)    
    user.slutCooldown = now + cooldown

   await updateChatUser(msg.chat, msg.sender, 'slutCooldown', user.slutCooldown)

    const winMessages = [
      `Organizaron una fiesta temática y ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Diste una increíble presentación en el club y te llevaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Tu baile deslumbró a todos y ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Fuiste el centro de atención y ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Tu carisma y encanto deslumbraron y ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Lograste un trato increíble con productores y ganaste *¥${amount.toLocaleString()} ${currency}*!`,
    ]

    const loseMessages = [
      `Tu energía se fue y no brillaste, perdiendo *¥${amount.toLocaleString()} ${currency}*.`,
      `Cometiste un error en tu actuación y perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `Un cliente malhumorado te causó problemas y perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `Tu atuendo no fue bien recibido y perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `El sonido falló en medio de tu actuación y perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `Un mal día en el club resultó en una pérdida de *¥${amount.toLocaleString()} ${currency}*.`,
    ]

    const message = success
      ? winMessages[Math.floor(Math.random() * winMessages.length)]
      : loseMessages[Math.floor(Math.random() * loseMessages.length)]

    if (success) {
      user.coins = (user.coins || 0) + amount

   await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
    } else {
      const total = (user.coins || 0) + (user.bank || 0)
      if (total >= amount) {
        if (user.coins >= amount) {
          user.coins -= amount
   await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
        } else {
          const remainingLoss = amount - user.coins
          user.coins = 0
          user.bank -= remainingLoss

   await updateChatUser(msg.chat, msg.sender, 'coins', user.bank)
   await updateChatUser(msg.chat, msg.sender, 'bank', user.bank)
        }
      } else {
        user.coins = 0
        user.bank = 0

   await updateChatUser(msg.chat, msg.sender, 'coins', user.bank)
   await updateChatUser(msg.chat, msg.sender, 'bank', user.bank)
      }
    }

   await sock.reply(
      msg.chat, `「✿」 ${message}`, msg)
  }
};
