import fs from 'fs';

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  return minutes === 0
    ? `${seconds} segundo${seconds > 1 ? 's' : ''}`
    : `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const months = [
    'enero','febrero','marzo','abril','mayo','junio','julio',
    'agosto','septiembre','octubre','noviembre','diciembre'
  ]
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
}

export default {
  command: ['claim', 'c'],
  category: 'gacha',
  run: async (sock, m, args) => {
    const chatId = m.chat
    const userId = m.sender
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const chatConfig = await getChat(chatId)
    const botSettings = await getSettings(botId)
    const monedas = botSettings.currency
    const user = await getChatUser(chatId, userId)
    const now = Date.now()

    if (chatConfig.adminonly || !chatConfig.gacha)
      return m.reply(mess.comandooff)

    if (!user.buyCooldown) user.buyCooldown = 0
    const remainingTime = user.buyCooldown - Date.now()
    if (remainingTime > 0)
      return m.reply(
        `《✤》 Debes esperar *${msToTime(remainingTime)}* para usar *"${m.command}"* nuevamente`,
      )

    if (!m.quoted) return m.reply(`《✤》 Responde a una waifu para reclamarla.`)

    let reservedCharacter = null
    const quotedId = m.quoted?.id

    reservedCharacter = chatConfig.personajesReservados?.find(p => p.messageId === quotedId)

    if (!reservedCharacter) {
      return m.reply(`✿ Solo puedes reclamar personajes generados con *rollwaifu*.`)
    }

    const chatUsers = await getChatUser(chatId)
    const alreadyClaimed = chatUsers.find(u =>
      u.characters?.some(c => c.name?.toLowerCase() === reservedCharacter.name.toLowerCase()),
    )

    if (alreadyClaimed) {
      if (alreadyClaimed.user_id === userId)
        return m.reply(`✤ Tú ya has reclamado a *${reservedCharacter.name}*.`)
      const userData = await getUser(alreadyClaimed.user_id)
      const ownerName = userData?.name || alreadyClaimed.user_id.split('@')[0]
      return m.reply(
        `❀ El personaje *${reservedCharacter.name}* ya ha sido reclamado por *${ownerName}*.`,
      )
    }

    if (reservedCharacter.userId && now < reservedCharacter.reservedUntil) {
      const isUserReserver = reservedCharacter.userId === userId
      const reserverData = await getUser(reservedCharacter.userId)
      const reserverName = reserverData?.name || reservedCharacter.userId.split('@')[0]
      const secondsLeft = ((reservedCharacter.reservedUntil - now) / 1000).toFixed(1)
      if (!isUserReserver)
        return m.reply(
          `✿ *${reservedCharacter.name}* está protegido por *${reserverName}* durante *${secondsLeft}s*`,
        )
    }

    if (
      reservedCharacter.expiresAt &&
      now > reservedCharacter.expiresAt &&
      !reservedCharacter.user &&
      !(reservedCharacter.userId && now < reservedCharacter.reservedUntil)
    ) {
      const expiredTime = ((now - reservedCharacter.expiresAt) / 1000).toFixed(1)
      return m.reply(
        `❖ El personaje *${reservedCharacter.name}* ha expirado hace *${expiredTime}s*.`,
      )
    }

    if (user.coins < reservedCharacter.value)
      return m.reply(
        `《✤》 No tienes suficiente *${monedas}* para comprar a *${reservedCharacter.name}*.`,
      )

    user.characters = user.characters || []
    user.characters.push({
      name: reservedCharacter.name,
      value: reservedCharacter.value,
      gender: reservedCharacter.gender,
      source: reservedCharacter.source,
      keyword: reservedCharacter.keyword,
      claim: formatDate(now),
      user: userId,
    })

    const personajesReservados = chatConfig.personajesReservados.filter(
      p => p.id !== reservedCharacter.id,
    )
    
    await updateChatUser(chatId, userId, 'characters', user.characters)
    await updateChatUser(chatId, userId, 'buyCooldown', now + 15 * 60000)
    await updateChatUser(chatId, userId, 'coins', user.coins - reservedCharacter.value)
    await updateChat(chatId, 'personajesReservados', personajesReservados)

    const userData = await getUser(userId)
    const displayName = userData?.name || userId.split('@')[0]
    const duration = ((now - reservedCharacter.expiresAt + 60000) / 1000).toFixed(1)

    const frases = [
      `*${reservedCharacter.name}* ha sido reclamado por *${displayName}*`,
      `*${displayName}* se llevó a *${reservedCharacter.name}* al valle de la Pascua`,
      `*${displayName}* se llevó a *${reservedCharacter.name}* a la cama`,
      `*${displayName}* se llevó a *${reservedCharacter.name}* a la luna de miel`,
      `*${reservedCharacter.name}* reclutada por *${displayName}* para actos de terrorismo`,
      `*${displayName}* ha reclamado a *${reservedCharacter.name}*`,
      `*${displayName}* hizo dudar de su existencia a *${reservedCharacter.name}*`,
      `*${displayName}* llevó a *${reservedCharacter.name}* a explorar el multiverso`,
      `*${reservedCharacter.name}* ahora es fiel compañero de *${displayName}* en mil aventuras`,
      `*${displayName}* robó el corazón de *${reservedCharacter.name}* con una mirada`,
      `*${displayName}* fue elegido por *${reservedCharacter.name}* para gobernar juntos el reino`,
      `*${displayName}* encendió la chispa en *${reservedCharacter.name}*, y no hubo marcha atrás`,
      `*${displayName}* cayó rendido ante los encantos de *${displayName}*`,
      `*${displayName}* invitó a *${reservedCharacter.name}* a una noche inolvidable bajo las estrellas`,
      `*${displayName}* desató emociones intensas en *${reservedCharacter.name}* con solo un suspiro`,
      `*${reservedCharacter.name}* y *${displayName}* desaparecieron entre susurros y miradas ardientes`,
    ]

    const final = frases[Math.floor(Math.random() * frases.length)]
    await sock.reply(chatId, `✐ ${final} _(${duration}s)_`, m)
  },
}
