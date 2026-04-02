export default {
  command: ['buycharacter', 'buychar', 'buyc'],
  category: 'gacha',
  async run(sock, m, args) {
   try {
    const chatId = m.chat
    const userId = m.sender
    
    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return m.reply(mess.comandooff)

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const monedas = botSettings?.currency || 'monedas'

    const personajeNombre = args.join(' ')?.trim()?.toLowerCase()
    if (!personajeNombre)
      return m.reply(`《✤》 Especifica el nombre del personaje que deseas comprar.`)

    const chatUsers = await getChatUser(chatId)
    
    const personajesEnVenta = []
    for (const user of chatUsers) {
      if (user.personajesEnVenta && user.personajesEnVenta.length > 0) {
        user.personajesEnVenta.forEach(p => {
          personajesEnVenta.push({
            ...p,
            vendedor: user.user_id
          })
        })
      }
    }

    if (personajesEnVenta.length === 0)
      return m.reply(`✐ No hay personajes disponibles para comprar en este chat.`)

    const personaje = personajesEnVenta.find((p) => p.name.toLowerCase() === personajeNombre)
    if (!personaje)
      return m.reply(`✎ No se encontró el personaje *${personajeNombre}* en la lista de ventas.`)

     if (personaje.vendedor === userId) {
      return m.reply(`✎ No puedes comprar tu propio personaje *${personaje.name}*.`)
     }
     
    const comprador = await getChatUser(chatId, userId)
    
    if (comprador.coins < personaje.precio)
      return m.reply(
        `✎ No tienes suficientes *${monedas}* para comprar *${personaje.name}*. Necesitas *${personaje.precio.toLocaleString()} ${monedas}*.`,
      )

    comprador.coins -= personaje.precio
    await updateChatUser(chatId, userId, 'coins', comprador.coins)

    const vendedorId = personaje.vendedor
    const vendedor = await getChatUser(chatId, vendedorId)
    
    vendedor.coins += personaje.precio
    await updateChatUser(chatId, vendedorId, 'coins', vendedor.coins)

    if (!comprador.characters) comprador.characters = []
    comprador.characters.push({ name: personaje.name })
    await updateChatUser(chatId, userId, 'characters', comprador.characters)

    vendedor.personajesEnVenta = vendedor.personajesEnVenta?.filter(
      (p) => p.name.toLowerCase() !== personajeNombre,
    ) || []
    await updateChatUser(chatId, vendedorId, 'personajesEnVenta', vendedor.personajesEnVenta)

    const userComprador = await getUser(userId)
    const userVendedor = await getUser(vendedorId)
    
    const nombreComprador = userComprador?.name || userId.split('@')[0]
    const nombreVendedor = userVendedor?.name || vendedorId.split('@')[0]

    const mensaje = `✐ *${personaje.name}* ha sido comprado por *${nombreComprador}*.\n\n> Se han transferido *${personaje.precio.toLocaleString()} ${monedas}* a *${nombreVendedor}*.`

    await m.reply(mensaje)
   } catch (e) {
     m.reply(msgglobal + e)
   }
  },
}
