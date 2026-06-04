import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['delbirth'],
  category: 'profile',
  run: async ({ msg, sock }) => {
    const user = await getUser(msg.sender)
    if (!user.birth) return msg.reply(`ꕥ No tienes una fecha de nacimiento establecida.`)

    user.birth = ''

   await updateUser(msg.sender, 'birth', user.birth)
    return msg.reply(`✐ Tu fecha de nacimiento ha sido eliminada.`)
  },
};