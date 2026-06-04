import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['delpasatiempo', 'removehobby'],
  category: 'profile',
  run: async ({ msg, sock, args }) => {
    const user = await getUser(msg.sender)

    if (!user.pasatiempo || user.pasatiempo === 'No definido') {
      return msg.reply('ꕥ No tienes ningún pasatiempo establecido.')
    }

    const pasatiempoAnterior = user.pasatiempo

    user.pasatiempo = 'No definido'

    await updateUser(msg.sender, 'pasatiempo', user.pasatiempo)
    return msg.reply(`✐ Se ha eliminado tu pasatiempo.`)
  },
};