import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['delchar', 'delwaifu', 'deletechar'],
  category: 'gacha',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    const userId = msg.sender

    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return msg.reply(mess.comandooff)

    const userData = await getChatUser(chatId, userId)

    if (!userData?.characters?.length)
      return msg.reply('《✤》 No tienes personajes reclamados en tu inventario.')

    if (!args[0])
      return msg.reply('✐ Debes especificar el nombre del personaje que deseas eliminar.')

    const characterName = args.join(' ').toLowerCase()
    const characterIndex = userData.characters.findIndex(
      (c) => c.name?.toLowerCase() === characterName,
    )

    if (characterIndex === -1)
      return msg.reply(`《✤》 El personaje *${args.join(' ')}* no está en tu inventario.`)

    const removed = userData.characters.splice(characterIndex, 1)[0]
    
    await updateChatUser(chatId, userId, 'characters', userData.characters)

    return msg.reply(
      `✎ El personaje *${removed.name}* ha sido eliminado exitosamente de tu inventario.`,
    )
  },
}
