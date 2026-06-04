import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

export default {
  command: ['giveallharem'],
  category: 'gacha',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    const senderId = msg.sender
    
    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return msg.reply(mess.comandooff)

    const texto = msg.mentionedJid
    const mentionedJid = texto.length > 0 ? texto[0] : msg.quoted ? msg.quoted.sender : false

    if (!mentionedJid || mentionedJid === senderId)
      return msg.reply('《✤》 Menciona al usuario al que deseas regalar todos tus personajes.')

    const fromUser = await getChatUser(chatId, senderId)

    if (!fromUser?.characters?.length)
      return msg.reply('✧ No tienes personajes en tu inventario.')

    let toUser = await getChatUser(chatId, mentionedJid)
    
    if (!toUser) {
      toUser = await getChatUser(chatId, mentionedJid)
    }

    const charactersToTransfer = [...fromUser.characters]
    
    for (const char of charactersToTransfer) {
      if (!toUser.characters) toUser.characters = []
      toUser.characters.push(char)
    }

    await updateChatUser(chatId, mentionedJid, 'characters', toUser.characters)

    fromUser.characters = []
    await updateChatUser(chatId, senderId, 'characters', fromUser.characters)

    const globalReceiver = await getUser(mentionedJid)
    const nameReceiver = globalReceiver?.name || mentionedJid.split('@')[0]
    
    const message = `✐ Regalaste todos tus personajes al usuario *${nameReceiver}*.`

    await msg.reply(message)
  },
}
