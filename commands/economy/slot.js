import { delay } from "@whiskeysockets/baileys"

export default {
  command: ['slot'],
  category: 'rpg',
      run: async (client, m, args, command, text, prefix) => {
    const db = global.db.data
    const chat = db.chats[m.chat]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const bot = db.settings[botId]
    const currency = bot.currency
    const user = db.chats[m.chat].users[m.sender]
    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    const remainingTime = user.lastslot - Date.now()
    if (remainingTime > 0) {
      return client.reply(m.chat, `ꕥ Debes esperar *${formatTime(remainingTime)}* antes de volver a jugar.`, m)
    }

   // user.lastslot ||= 0
    if (!args[0] || isNaN(args[0]) || parseInt(args[0]) <= 0) {
      return m.reply(`《✤》 Por favor, ingresa la cantidad que deseas apostar.`)
    }
    const apuesta = parseInt(args[0])
    if (apuesta < 500) return m.reply(`《✤》 El mínimo para apostar es de 500 *${currency}*.`)
    if (user.coins < apuesta) return m.reply(`「✿」 Tus *${currency}* no son suficientes para apostar esa cantidad.`)
    const emojis = ['🍒', '🦕', '🍉']
    const getRandomEmojis = () => {
      const x = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
      const y = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
      const z = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
      return { x, y, z }
    }
    const initialText = 'ꕤ | *SLOTS* \n────────\n'
    let { key } = await client.sendMessage(m.chat, { text: initialText }, { quoted: m })
    const animateSlots = async () => {
      for (let i = 0; i < 5; i++) {
        const { x, y, z } = getRandomEmojis()
        const animationText = `ꕤ | *SLOTS* 
────────
${x[0]} : ${y[0]} : ${z[0]}
${x[1]} : ${y[1]} : ${z[1]}
${x[2]} : ${y[2]} : ${z[2]}
────────`
        await client.sendMessage(m.chat, { text: animationText, edit: key }, { quoted: m })
        await delay(300)
      }
    }
    await animateSlots()
    const { x, y, z } = getRandomEmojis()
    let resultado
    if (x[0] === y[0] && y[0] === z[0]) {
      resultado = `「✿」 Ganaste! *¥${(apuesta * 2).toLocaleString()} ${currency}*.`
      user.coins += apuesta
    } else if (x[0] === y[0] || x[0] === z[0] || y[0] === z[0]) {
      resultado = `「✎」 Casi lo logras. *Toma ¥10 ${currency}* por intentarlo.`
      user.coins += 10
    } else {
      resultado = `「✿」 Perdiste *¥${apuesta.toLocaleString()} ${currency}*.`
      user.coins -= apuesta
    }
       user.lastslot = Date.now() + 10 * 60 * 1000
    const finalText = `ꕤ | *SLOTS* 
────────
${x[0]} : ${y[0]} : ${z[0]}
${x[1]} : ${y[1]} : ${z[1]}
${x[2]} : ${y[2]} : ${z[2]}
────────
${resultado}`
    await client.sendMessage(m.chat, { text: finalText, edit: key }, { quoted: m })
  }
}

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const parts = []
  if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
  return parts.join(' ')
}