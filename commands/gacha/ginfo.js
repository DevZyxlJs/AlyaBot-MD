export default {
  command: ['gachainfo', 'ginfo', 'infogacha'],
  category: 'gacha',
  run: async (client, m, args) => {
    const chatId = m.chat
    const userId = m.sender
    const chatData = db.data.chats[chatId]
    const user = chatData.users[userId]
    const now = Date.now()

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(mess.comandooff)

    const cooldowns = {
      vote: Math.max(0, (user.voteCooldown || 0) - now),
      roll: Math.max(0, (user.rwCooldown || 0) - now),
      claim: Math.max(0, (user.buyCooldown || 0) - now)
    }

    const formatTime = (ms) => {
      const totalSeconds = Math.floor(ms / 1000)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      const parts = []
      if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`)
      if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`)
      if (seconds > 0) parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`)
      return parts.join(' ')
    }

    const nombre = db.data.users[userId]?.name || userId.split('@')[0]
    const personajes = user.characters || []
    const valorTotal = personajes.reduce((acc, char) => acc + (char.value || 0), 0)

    const mensaje = `ׅ  ׄ  ꕤ   ׅ り Usuario \`<${nombre}>\`

𖹭᳔ㅤㅤㅤׄㅤㅤ✿ㅤㅤׅㅤㅤゕㅤㅤׄㅤㅤㅤ𑄾𑄾

ׅ  ׄ  ✤   ׅ り RollWaifu » *${cooldowns.roll > 0 ? formatTime(cooldowns.roll) : 'Ahora.'}*
ׅ  ׄ  ✤   ׅ り Claim » *${cooldowns.claim > 0 ? formatTime(cooldowns.claim) : 'Ahora.'}*
ׅ  ׄ  ✤   ׅ り Vote » *${cooldowns.vote > 0 ? formatTime(cooldowns.vote) : 'Ahora.'}*

𖹭᳔ㅤㅤㅤׄㅤㅤ✿ㅤㅤׅㅤㅤゕㅤㅤׄㅤㅤㅤ𑄾𑄾

ׅ  ׄ  ❀   ׅ り Personajes reclamados » *${personajes.length}*
ׅ  ׄ  ⛁   ׅ り Valor total » *${valorTotal.toLocaleString()}*`

   // await m.reply(mensaje)

await client.sendContextInfoIndex(m.chat, mensaje, {}, m, true, {})
  }
};