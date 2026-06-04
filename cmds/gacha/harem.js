import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import fs from 'fs';

async function loadCharacters() {
  try {
    return JSON.parse(fs.readFileSync('./lib/characters.json', 'utf-8'))
  } catch {
    return {}
  }
}

function findCharacterMatch(char, charactersData) {
  return Object.values(charactersData)
    .flatMap(s => Array.isArray(s.characters) ? s.characters : [])
    .find(c => c.name === char.name)
}

export default {
  command: ['harem', 'miswaifus', 'claims'],
  category: 'gacha',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    const mentioned = msg.mentionedJid
    const userId = mentioned.length > 0 ? mentioned[0] : (msg.quoted ? msg.quoted.sender : msg.sender)

    const globalUser = await getUser(userId)
    const name = globalUser?.name || userId.split('@')[0]
    
    const chatConfig = await getChat(chatId)

    if (chatConfig.adminonly || !chatConfig.gacha)
      return msg.reply(mess.comandooff)

    const userData = await getChatUser(chatId, userId)

    if (!userData?.characters?.length) {
      return msg.reply(
        userId === msg.sender
          ? `✐ No tienes personajes reclamados en tu inventario.`
          : `✐ *${name}* no tiene personajes reclamados en su inventario.`
      )
    }

    const charactersData = await loadCharacters()
    const total = userData.characters.length
    const perPage = 20
    const page = Math.max(1, parseInt(args[0]) || 1)
    const pages = Math.ceil(total / perPage)

    if (page > pages)
      return msg.reply(`✎ Página inválida. Hay un total de *${pages}* página${pages > 1 ? 's' : ''}`)

    const start = (page - 1) * perPage
    const end = Math.min(start + perPage, total)
    const charactersOnPage = userData.characters.slice(start, end)

    let message = `❀ Personajes reclamados ❀
⌦ Usuario: *${name}*
♡ Personajes: *(${total}):*\n\n`

    charactersOnPage.forEach((char, i) => {
      const match = findCharacterMatch(char, charactersData)
      const value = match?.value?.toLocaleString() || char.value?.toLocaleString() || 'Desconocido'
      const label = match?.name || char.name || 'Desconocido'
      message += `> ${start + i + 1}. *${label}* (${value})\n`
    })

    message += `\n➮ Página *${page}* de *${pages}*`

    await msg.reply(message)
  }
}
