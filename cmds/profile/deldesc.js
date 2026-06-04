import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['deldescription', 'deldesc'],
  category: 'profile',
  run: async ({ msg, sock }) => {
    const user = await getUser(msg.sender)
    if (!user.description) return msg.reply(`ꕥ No tienes una descripción establecida.`)

    user.description = ''

    await updateUser(msg.sender, 'description', user.description)
    return msg.reply(`✐ Tu descripción ha sido eliminada.`)
  },
};