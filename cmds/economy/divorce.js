import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['divorce'],
  category: 'rpg',
  run: async ({ msg, sock }) => {
    const user = await getUser(msg.sender)
    const partnerId = user.marry
    const user2 = await getUser(partnerId)

    if (!partnerId) return msg.reply('ꕥ Tú no estás casado con nadie.')

    user.marry = ''
    user2.marry = ''

    await updateUser(msg.sender, 'marry', user.marry)
    await updateUser(partnerId, 'marry', user2.marry)

    return msg.reply(
      `✐ *${msg.pushName || userId.split('@')[0]}* te has divorciado de *${user2.name || partnerId.split('@')[0]}*.`,
    )
  },
};
