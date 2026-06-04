import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import { delay } from "baileys"

export default {
  command: ['slot'],
  category: 'rpg',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chat = await getChat(msg.chat)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const bot = await getSettings(botId)
    const currency = bot.currency
    const user = await getChatUser(msg.chat, msg.sender)

    if (chat.adminonly || !chat.rpg)
      return msg.reply(mess.comandooff)

    const remainingTime = user.lastslot - Date.now()
    if (remainingTime > 0) {
      return sock.reply(msg.chat, `ꕥ Debes esperar *${formatTime(remainingTime)}* antes de volver a jugar.`, msg)
    }

    if (!args[0] || isNaN(args[0]) || parseInt(args[0]) <= 0) {
      return msg.reply(`《✤》 Por favor, ingresa la cantidad que deseas apostar.`)
    }

    const apuesta = parseInt(args[0])
    if (apuesta < 500) return msg.reply(`《✤》 El mínimo para apostar es de 500 *${currency}*.`)

    if (user.coins < apuesta) {
      if (user.bank >= apuesta) {
        user.bank -= apuesta
        user.coins += apuesta
        await updateChatUser(msg.chat, msg.sender, 'bank', user.bank)
        await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
      } else {
        return msg.reply(`「✿」 No tienes suficientes *${currency}* ni en tu banco.`)
      }
    }

    const emojis = ['🍒', '🦕', '🍉']
    const getRandomEmojis = () => {
      const x = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
      const y = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
      const z = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
      return { x, y, z }
    }

    const initialText = 'ꕤ | *SLOTS* \n────────\n'
    let { key } = await sock.sendMessage(msg.chat, { text: initialText }, { quoted: msg })

    const animateSlots = async () => {
      for (let i = 0; i < 5; i++) {
        const { x, y, z } = getRandomEmojis()
        const animationText = `ꕤ | *SLOTS* 
────────
${x[0]} : ${y[0]} : ${z[0]}
${x[1]} : ${y[1]} : ${z[1]}
${x[2]} : ${y[2]} : ${z[2]}
────────`
        await sock.sendMessage(msg.chat, { text: animationText, edit: key }, { quoted: msg })
        await delay(300)
      }
    }
    await animateSlots()

    const { x, y, z } = getRandomEmojis()
    let resultado
    if (x[0] === y[0] && y[0] === z[0]) {
      resultado = `「✿」 Ganaste! *¥${(apuesta * 2).toLocaleString()} ${currency}*.`
      user.coins += apuesta
      await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
    } else if (x[0] === y[0] || x[0] === z[0] || y[0] === z[0]) {
      resultado = `「✎」 Casi lo logras. *Toma ¥10 ${currency}* por intentarlo.`
      user.coins += 10
      await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
    } else {
      resultado = `「✿」 Perdiste *¥${apuesta.toLocaleString()} ${currency}*.`
      if (user.coins >= apuesta) {
        user.coins -= apuesta
        await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
      } else {
        user.bank -= apuesta
        await updateChatUser(msg.chat, msg.sender, 'bank', user.bank)
      }
    }

    user.lastslot = Date.now() + 10 * 60 * 1000
    await updateChatUser(msg.chat, msg.sender, 'lastslot', user.lastslot)

    const finalText = `ꕤ | *SLOTS* 
────────
${x[0]} : ${y[0]} : ${z[0]}
${x[1]} : ${y[1]} : ${z[1]}
${x[2]} : ${y[2]} : ${z[2]}
────────
${resultado}`
    await sock.sendMessage(msg.chat, { text: finalText, edit: key }, { quoted: msg })
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