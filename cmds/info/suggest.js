import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['report', 'reporte', 'sug', 'suggest'],
  category: 'info',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const texto = args.join(' ').trim()
    const now = Date.now()

    try {
      const userData = await getUser(msg.sender)

      const cooldown = userData.sugCooldown || 0
      const restante = cooldown - now
      if (restante > 0) {
        return msg.reply(`《✤》 Espera *${msToTime(restante)}* para volver a usar este comando.`)
      }

      if (!texto) {
        return msg.reply(`《✤》 Debes *escribir* el *reporte* o *sugerencia*.`)
      }

      if (texto.length < 10) {
        return msg.reply('✿ Tu mensaje es *demasiado corto*. Explica mejor tu reporte/sugerencia (mínimo 10 caracteres)')
      }

      const fecha = new Date()
      const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      const fechaLocal = fecha.toLocaleDateString('es-MX', opcionesFecha)

      const tipo = (command === 'report' || command === 'reporte') ? '🆁ҽ𝕡σɾƚҽ' : '🆂մց𝕖ɾҽ𝚗cíᥲ'
      const tipo2 = (command === 'report' || command === 'reporte') ? 'ꕥ Reporte' : 'ꕥ Sugerencia'
      const displayName = msg.pushName || 'Usuario desconocido'
      const numero = msg.sender.split('@')[0]
      const pp = await sock.profilePictureUrl(msg.sender, 'image').catch(() => 'https://cdn.sockywa.xyz/files/1755559736781.jpeg')

      let reportMsg =
        `🫗۫᷒ᰰ⃘ׅ᷒  ۟　\`${tipo}\`　ׅ　ᩡ\n\n` +
        `𖹭  ׄ  ְ 🍒 *Nombre*\n> ${displayName}\n\n` +
        `𖹭  ׄ  ְ 🦩 *Número*\n> wa.me/${numero}\n\n` +
        `𖹭  ׄ  ְ 🌱 *Fecha*\n> ${fechaLocal}\n\n` +
        `𖹭  ׄ  ְ 🍓 *Mensaje*\n> ${texto}\n\n` +
        dev

      try {
        await global.sock.reply('120363416930479619@g.us', reportMsg, msg)
      } catch {
        try {
          for (const nums of global.mods) {
            await sock.reply(`${nums}@s.whatsapp.net`, reportMsg, msg)
          }
        } catch {}
      }

      userData.sugCooldown = now + 24 * 60 * 60000
      await updateUser(msg.sender, 'sugCooldown', userData.sugCooldown)

      msg.reply(
        `《✤》 Gracias por tu *${(command === 'report' || command === 'reporte') ? 'reporte' : 'sugerencia'}*\n\n> Tu mensaje fue enviado correctamente a los moderadores`
      )
    } catch {
      msg.reply(msgglobal)
    }
  },
}

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))

  const s = seconds.toString().padStart(2, '0')
  const msg = minutes.toString().padStart(2, '0')
  const h = hours.toString().padStart(2, '0')
  const d = days.toString()

  const parts = []
  if (days > 0) parts.push(`${d} día${d > 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${h} hora${h > 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${msg} minuto${msg > 1 ? 's' : ''}`)
  parts.push(`${s} segundo${s > 1 ? 's' : ''}`)

  return parts.join(', ')
}