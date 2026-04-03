export default {
  command: ['removesale', 'removerventa'],
  category: 'gacha',
  run: async (sock, m, args) => {
    try {
    const chatId = m.chat
    const userId = m.sender
    const characterName = args.join(' ')?.trim()?.toLowerCase()

    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return m.reply(mess.comandooff)

    if (!characterName) 
      return m.reply('《✤》 Especifica el nombre del personaje que deseas cancelar.')

    const userData = await getChatUser(chatId, userId)

    if (!userData.personajesEnVenta?.length) 
      return m.reply('✤ No tienes personajes en venta.')

    const index = userData.personajesEnVenta.findIndex(
      (p) => p.name?.toLowerCase() === characterName,
    )
    
    if (index === -1)
      return m.reply(`✎ No se encontró el personaje *${characterName}* en tu lista de ventas.`)

    const personajeCancelado = userData.personajesEnVenta.splice(index, 1)[0]
    
    await updateChatUser(chatId, userId, 'personajesEnVenta', userData.personajesEnVenta)

    if (!userData.characters) userData.characters = []
    userData.characters.push(personajeCancelado)
    
    await updateChatUser(chatId, userId, 'characters', userData.characters)

    await sock.reply(chatId, `✐ Tu personaje *${personajeCancelado.name}* ha sido retirado de la venta.`, m)
    } catch (e) {
      m.reply(msgglobal + e)
    }
  },
}
