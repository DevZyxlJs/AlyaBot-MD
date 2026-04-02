import { readFileSync } from 'fs'
import { resolveLidToRealJid } from "../../lib/utils.ts"

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ]
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
}

export default {
  command: ['givechar', 'givewaifu', 'regalar'],
  category: 'gacha',
  run: async (client, m, args) => {
    const chatId = m.chat
    const senderId = m.sender
    
    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return m.reply(mess.comandooff)

    const mentioned = m.mentionedJid || []
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)
    
    if (!who2) 
      return m.reply('《✤》 Menciona al usuario o responde a su mensaje junto con el nombre del personaje.')
    
    const mentionedJid = await resolveLidToRealJid(who2, client, m.chat)

    if (mentionedJid === senderId)
      return m.reply('✐ No puedes regalarte un personaje a ti mismo.')

    const senderData = await getChatUser(chatId, senderId)
    
    if (!senderData?.characters?.length) 
      return m.reply('✐ No tienes personajes en tu inventario.')

    const characterName = args
      .filter((arg) => !arg.startsWith('@'))
      .join(' ')
      .toLowerCase()
      .trim()

    const characterIndex = senderData.characters.findIndex(
      (c) => c.name?.toLowerCase() === characterName
    )
    
    if (characterIndex === -1)
      return m.reply(`ꕥ No tienes el personaje *${characterName}* en tu inventario.`)

    try {
      const characterDetails = JSON.parse(readFileSync('./lib/characters.json', 'utf8'))
      const original = characterDetails.find((c) => c.name.toLowerCase() === characterName)
      
      if (!original)
        return m.reply(`✿ No se encontró el personaje *${characterName}* en la base de datos.`)

      const reservedCharacter = {
        name: original.name,
        value: original.value,
        gender: original.gender,
        source: original.source,
        keyword: original.keyword,
        claim: formatDate(Date.now())
      }

      let receiver = await getChatUser(chatId, mentionedJid)
      
      if (!receiver) {
        receiver = await getChatUser(chatId, mentionedJid)
      }

      if (!Array.isArray(receiver.characters)) {
        receiver.characters = []
      }

      receiver.characters.push(reservedCharacter)
      await updateChatUser(chatId, mentionedJid, 'characters', receiver.characters)

      senderData.characters.splice(characterIndex, 1)
      await updateChatUser(chatId, senderId, 'characters', senderData.characters)

      const message = `✐ *${reservedCharacter.name}* ha sido regalado a *@${mentionedJid.split('@')[0]}*.`

      await client.reply(chatId, message, m, { mentions: [mentionedJid] })
      
    } catch (e) {
      console.error(e)
      await m.reply(msgglobal)
    }
  }
}
