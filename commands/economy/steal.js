import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['steal', 'rob', 'robar'],
  category: 'rpg',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const monedas = botSettings.currency
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(mess.comandooff)

    const mentioned = m.mentionedJid || []
    const who2 = mentioned[0] || (m.quoted ? m.quoted.sender : null)
    const target = await resolveLidToRealJid(who2, client, m.chat);

    if (!who2 || target === m.sender)
      return m.reply(`《✤》 Debes mencionar a quien quieras robarle *${monedas}*.`)

    const senderData = chatData.users[m.sender]
    const targetData = chatData.users[target]

    if (!targetData) {
      return m.reply('ꕥ El usuario *mencionado* no está *registrado* en el bot')
    }

    if (targetData.coins < 50)
      return m.reply(
        `ꕤ *${db.users[target]?.name || target.split('@')[0]}* no tiene suficiente *${monedas}* para robarle.`,
      )

   // senderData.roboCooldown ||= 0
    const remainingTime = senderData.roboCooldown - Date.now()

    if (remainingTime > 0)
      return m.reply(
        `ꕥ Debes esperar *${msToTime(remainingTime)}* antes de intentar robar nuevamente.`,
      )

    senderData.roboCooldown = Date.now() + 30 * 60 * 1000 // 30 minutos

    const cantidadRobada = Math.min(Math.floor(Math.random() * 5000) + 50, targetData.coins)
    senderData.coins += cantidadRobada
    targetData.coins -= cantidadRobada

await client.reply(
  chatId,
  `✐ Le robaste *¥${cantidadRobada.toLocaleString()} ${monedas}* a *${db.users[target]?.name || target.split('@')[0]}*.`,
  m,
  { mentions: [target] }
)
  },
};

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  return `${minutes} minuto${minutes !== 1 ? 's' : ''}, ${seconds} segundo${seconds !== 1 ? 's' : ''}`
}
