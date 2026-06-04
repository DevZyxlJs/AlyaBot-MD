import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import { readFileSync } from 'fs'

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
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    const senderId = msg.sender
    
    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return msg.reply(mess.comandooff)

    const mentioned = msg.mentionedJid || []
    const mentionedJid = mentioned.length > 0 ? mentioned[0] : (msg.quoted ? msg.quoted.sender : false)
    
    if (!mentionedJid) 
      return msg.reply('《✤》 Menciona al usuario o responde a su mensaje junto con el nombre del personaje.')
    
    if (mentionedJid === senderId)
      return msg.reply('✐ No puedes regalarte un personaje a ti mismo.')

    const senderData = await getChatUser(chatId, senderId)
    
    if (!senderData?.characters?.length) 
      return msg.reply('✐ No tienes personajes en tu inventario.')

    const characterName = args
      .filter((arg) => !arg.startsWith('@'))
      .join(' ')
      .toLowerCase()
      .trim()

    const characterIndex = senderData.characters.findIndex(
      (c) => c.name?.toLowerCase() === characterName
    )
    
    if (characterIndex === -1)
      return msg.reply(`ꕥ No tienes el personaje *${characterName}* en tu inventario.`)

    try {
      const characterDetails = JSON.parse(readFileSync('./lib/characters.json', 'utf8'))
      const original = characterDetails.find((c) => c.name.toLowerCase() === characterName)
      
      if (!original)
        return msg.reply(`✿ No se encontró el personaje *${characterName}* en la base de datos.`)

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

      await sock.reply(chatId, message, msg, { mentions: [mentionedJid] })
      
    } catch (e) {
      console.error(e)
      await msg.reply(msgglobal)
    }
  }
}
