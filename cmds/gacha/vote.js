import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json'
const cooldownTime = 60 * 60 * 1000
let characterVotes = new Map()

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    throw new Error('ꕥ No se pudo cargar el archivo characters.json')
  }
}

async function saveCharacters(characters) {
  try {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2))
  } catch {
    throw new Error('ꕥ No se pudo guardar el archivo characters.json')
  }
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  if (hours === 0 && minutes === 0) return `${seconds} segundo${seconds !== 1 ? 's' : ''}`

  if (hours === 0)
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}, ${seconds} segundo${seconds !== 1 ? 's' : ''}`

  return `${hours} hora${hours !== 1 ? 's' : ''}, ${minutes} minuto${minutes !== 1 ? 's' : ''}`
}

export default {
  command: ['vote', 'votar'],
  category: 'gacha',
  run: async ({ msg, sock, args, command }) => {
    const chatId = msg.chat
    const userId = msg.sender
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const isOficialBot = botId === global.sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = await getSettings(botId)
    const isPremiumBot = settings?.botprem === 1
    const isModBot = settings?.botmod === 1

    if (!isOficialBot && !isPremiumBot && !isModBot) {
      return sock.reply(msg.chat, mess.solosub, msg)
    }

    const chatConfig = await getChat(chatId)
    const user = await getUser(userId)
    const chatUser = await getChatUser(chatId, userId)

    if (chatConfig.adminonly || !chatConfig.gacha)
      return msg.reply(mess.comandooff)

    if (!chatUser.voteCooldown) chatUser.voteCooldown = 0
    const remainingTime = chatUser.voteCooldown - Date.now()
    if (remainingTime > 0)
      return msg.reply(`✿ Debes esperar *${msToTime(remainingTime)}* para usar *vote* nuevamente`)

    if (args.length === 0)
      return msg.reply(`《✤》 Por favor, indica el nombre del personaje.`)

    try {
      const characterName = args.join(' ').toLowerCase().trim()
      const characters = await loadCharacters()
      const character = characters.find((c) => c.name.toLowerCase() === characterName)

      if (!character)
        return msg.reply(
          `❀ No se encontró el personaje *${characterName}*. Asegúrate de escribirlo correctamente`,
        )

      if ((character.votes || 0) >= 10) {
        return msg.reply(`✐ El personaje *${character.name}* ya tiene el valor máximo.`)
      }

      if (characterVotes.has(characterName)) {
        const expires = characterVotes.get(characterName)
        const cooldownLeft = expires - Date.now()
        if (cooldownLeft > 0)
          return msg.reply(
            `✎ *${character.name}* fue votado recientemente\nEspera *${msToTime(cooldownLeft)}* antes de volver a votar`,
          )
      }

      const incrementValue = Math.floor(Math.random() * 100) + 1
      character.value = (Number(character.value) || 0) + incrementValue
      character.votes = (character.votes || 0) + 1
      character.lastVoteTime = Date.now()

      await saveCharacters(characters)

      await updateChatUser(chatId, userId, 'voteCooldown', Date.now() + 90 * 60000)
      characterVotes.set(characterName, Date.now() + cooldownTime)

      const message = `ꕥ Votaste por *${character.name}*

> 𖣣ֶㅤ֯⌗ ⛀  ׄ ⬭ *Nuevo valor ›* ${character.value.toLocaleString()}
> 𖣣ֶㅤ֯⌗ ❀  ׄ ⬭ *Votos totales ›* ${character.votes}`
      await msg.reply(message)
    } catch (error) {
      await msg.reply(msgglobal)
    }
  },
}
