import fs from 'fs';

function obtenerCharacterValue(name) {
  const characterDataPath = './core/characters.json'
  if (!fs.existsSync(characterDataPath)) return 'Valor no disponible'
  const characterData = JSON.parse(fs.readFileSync(characterDataPath, 'utf-8'))
  const character = characterData.find((char) => char.name === name)
  return character ? character.value?.toLocaleString() : 'Valor no disponible'
}

function obtenerTiempoRestante(expira) {
  const ahora = Date.now()
  const diferencia = expira - ahora
  if (diferencia <= 0) return 'Expirado'

  const segundos = Math.floor((diferencia / 1000) % 60)
  const minutos = Math.floor((diferencia / (1000 * 60)) % 60)
  const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24)
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

  const partes = []
  if (dias > 0) partes.push(`${dias}d`)
  if (horas > 0) partes.push(`${horas}h`)
  if (minutos > 0) partes.push(`${minutos}m`)
  if (segundos > 0 || partes.length === 0) partes.push(`${segundos}s`)

  return partes.join(' ')
}

export default {
  command: ['haremshop', 'tiendawaifus', 'wshop'],
  category: 'gacha',
  run: async (sock, m, args) => {
    try {
    const chatId = m.chat
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    
    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return m.reply(mess.comandooff)

    const botSettings = await getSettings(botId)
    const monedas = botSettings?.currency || 'monedas'

    const chatUsers = await getChatUser(chatId)
    
    const personajesEnVenta = []
    
    for (const user of chatUsers) {
      if (user.personajesEnVenta && user.personajesEnVenta.length > 0) {
        const vendedorInfo = await getUser(user.user_id)
        
        user.personajesEnVenta.forEach(p => {
          personajesEnVenta.push({
            name: p.name,
            precio: p.precio,
            expira: p.expira,
            vendedor: user.user_id,
            vendedorNombre: vendedorInfo?.name || user.user_id.split('@')[0]
          })
        })
      }
    }

    if (personajesEnVenta.length === 0) 
      return m.reply('《✤》 No hay personajes en venta actualmente.')

    const page = parseInt(args[0]) || 1
    const perPage = 10
    const totalPages = Math.ceil(personajesEnVenta.length / perPage)

    if (page < 1 || page > totalPages)
      return m.reply(`✎ La página *${page}* no existe. Hay *${totalPages}* páginas.`)

    const start = (page - 1) * perPage
    const end = start + perPage
    const lista = personajesEnVenta.slice(start, end)

    let mensaje = `✰ ໌　۟　𝖧𝖺𝗋𝖾𝗆𝖲𝗁𝗈𝗉　ׅ　팅화　ׄ\n✐ Personajes en venta:\n\n`

    for (const p of lista) {
      const valorEstimado = obtenerCharacterValue(p.name)
      const tiempo = obtenerTiempoRestante(new Date(p.expira).getTime())
      
      mensaje += `> 𖣣ֶㅤ֯⌗ ꕤ  ׄ ⬭ *${p.name}* (✭ ${valorEstimado})\n` +
                 `> 𖣣ֶㅤ֯⌗ ⛁  ׄ ⬭ Precio › *${p.precio.toLocaleString()} ${monedas}*\n` +
                 `> 𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ Vendedor › *${p.vendedorNombre}*\n` +
                 `> 𖣣ֶㅤ֯⌗ ✤  ׄ ⬭ Expira › *${tiempo}*\n\n`
    }

    mensaje += `> ⌦ Página *${page}* de *${totalPages}*`


      await m.reply(mensaje)
    } catch (e) {
      await m.reply(`${e.message}`)
    }
  },
};
