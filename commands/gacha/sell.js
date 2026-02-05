export default {
  command: ['sell', 'vender'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data || ''
    const chatId = m.chat
    const userId = m.sender
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const currency = botSettings.currency
    const botname = botSettings.namebot2

    const chatData = db.chats[chatId] || {}
    if (chatData.adminonly || !chatData.gacha)
      return m.reply(mess.comandooff)

    try {
      const precioCoins = parseInt(args[0])
      const personajeNombre = args.slice(1).join(' ').trim().toLowerCase()

      if (!personajeNombre || isNaN(precioCoins))
        return m.reply(
          '《✤》 Especifica el valor y el nombre de la waifu a vender.'
        )

      const userData = chatData.users[userId] || {}
      if (!userData?.characters?.length) return m.reply('✐ No tienes personajes en tu inventario.')

      const characterIndex = userData.characters.findIndex(
        (c) => c.name?.toLowerCase() === personajeNombre,
      )
      if (characterIndex === -1)
        return m.reply(`✎ No tienes el personaje *${personajeNombre}* en tu inventario.`)

      if (precioCoins < 5000)
        return m.reply(`✎ El precio mínimo para vender un personaje es de *¥5,000 ${currency}*.`)

      if (precioCoins > 20000000)
        return m.reply(
          `✎ El precio máximo para vender un personaje es de *¥20,000,000 ${currency}*.`,
        )

      const character = userData.characters[characterIndex]
      const expira = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()

     // userData.personajesEnVenta ||= []
      userData.personajesEnVenta.push({
        ...character,
        precio: precioCoins,
        vendedor: userId,
        expira,
      })

      userData.characters.splice(characterIndex, 1)

      const mensaje = `❒ *${character.name}* ha sido puesto a la venta!

> 𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ Vendedor › *@${userId.split('@')[0]}*
> 𖣣ֶㅤ֯⌗ ⛀  ׄ ⬭ Valor › *${precioCoins.toLocaleString()} ${currency}*
> 𖣣ֶㅤ֯⌗ ❖  ׄ ⬭ Expira en › *3 días*

${dev}`
      await client.reply(
  chatId,
  mensaje,
  m,
  { mentions: [userId] }
)
    } catch (e) {
      await m.reply(msgglobal)
    }
  },
};

setInterval(
  () => {
    const db = global.db.data || ''
    for (const chatId in db.chats || {}) {
      const chatData = db.chats[chatId] || {}
      for (const userId in chatData.users || {}) {
        const user = chatData.users[userId] || {}
        user.personajesEnVenta =
          user.personajesEnVenta?.filter((p) => {
            const exp = new Date(p.expira)
            const expired = Date.now() > exp
            if (expired) {
             // user.characters ||= []
              user.characters.push(p)
            }
            return !expired
          }) || []
      }
    }
  },
  60 * 60 * 1000,
)
