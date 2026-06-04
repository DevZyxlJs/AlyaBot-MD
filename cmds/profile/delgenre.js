import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['delgenre'],
  category: 'profile',
  run: async ({ msg, sock }) => {
    const user = await getUser(msg.sender)
    if (!user.genre) return msg.reply(`ꕥ No tienes un género asignado.`)

    user.genre = ''

    await updateUser(msg.sender, 'genre', user.genre)
    return msg.reply(`✐ Tu género ha sido eliminado.`)
  },
};