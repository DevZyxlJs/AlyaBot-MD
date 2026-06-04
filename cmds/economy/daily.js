import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['daily'],
  category: 'rpg',
  run: async ({ msg, sock }) => {
    const chat = await getChat(msg.chat)
    const user = await getChatUser(msg.chat, msg.sender)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const monedas = botSettings.currency

    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const twoDays = oneDay * 2

    if (chat.adminonly || !chat.rpg)
      return msg.reply(mess.comandooff)

    const timeSinceLast = now - user.lastDaily

    if (timeSinceLast < oneDay) {
      const restante = formatRemainingTime(oneDay - timeSinceLast)
     return msg.reply(
        `ꕥ Ya has reclamado tu *Daily* de hoy.\n` +
        `> Puedes reclamarlo de nuevo en *${restante}*`
      ) 
    }

   if (timeSinceLast > twoDays) {
  const perdioRacha = user.dailyStreak >= 10
  user.dailyStreak = 1
  user.lastDaily = now

   await updateChatUser(msg.chat, msg.sender, 'dailyStreak', user.dailyStreak)
   await updateChatUser(msg.chat, msg.sender, 'lastDaily', user.lastDaily)

  const recompensa = calcularRecompensa(user.dailyStreak)
  const siguiente = calcularRecompensa(user.dailyStreak + 1)
  user.coins += recompensa

   await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)

    return sock.reply(msg.chat, `「✿」 Has reclamado tu recompensa diaria de *${recompensa.toLocaleString()} ${monedas}*! (Día *1*)\n` +
    `> Día *2* » *¥${siguiente.toLocaleString()}*` +
    (perdioRacha ? `\n> ☆ ¡Has perdido tu racha de días!` : ''), msg)
}

    user.dailyStreak += 1
    user.lastDaily = now

   await updateChatUser(msg.chat, msg.sender, 'dailyStreak', user.dailyStreak)
   await updateChatUser(msg.chat, msg.sender, 'lastDaily', user.lastDaily)

    const recompensa = calcularRecompensa(user.dailyStreak)
    const siguiente = calcularRecompensa(user.dailyStreak + 1)
    user.coins += recompensa

   await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)

    const rachaExtra = user.dailyStreak >= 10
      ? `\n> ☆ ¡Racha de *${user.dailyStreak}* días, ¡Sigue así!`
      : ''

    await sock.reply(msg.chat, `「✿」 Has reclamado tu recompensa diaria de *¥${recompensa.toLocaleString()} ${monedas}* (Día *${user.dailyStreak}*)\n` +
      `> Día *${user.dailyStreak + 1}* » *¥${siguiente.toLocaleString()}*${rachaExtra}`, msg, true)

  }
};

function calcularRecompensa(dia) {
  const base = 10000
  const incremento = 5000
  const maximo = 100000
  const recompensa = base + (dia - 1) * incremento
  return Math.min(recompensa, maximo)
}

function formatRemainingTime(ms) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor((s % 86400) / 3600)
  const msg = Math.floor((s % 3600) / 60)
  const seg = s % 60
  const partes = []
  if (h) partes.push(`${h} ${h === 1 ? 'hora' : 'horas'}`)
  if (msg) partes.push(`${msg} ${msg === 1 ? 'minuto' : 'minutos'}`)
  if (seg || partes.length === 0) partes.push(`${seg} ${seg === 1 ? 'segundo' : 'segundos'}`)
  return partes.join(' ')
}