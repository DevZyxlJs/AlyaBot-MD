import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setdescription', 'setdesc'],
  category: 'profile',
    run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const user = await getUser(msg.sender)
    const input = args.join(' ')

    if (user.description)
      return msg.reply(
        `✐ Ya tienes una descripción. Usa › *${prefix}deldescription* para eliminarla.`,
      )

    if (!input)
      return msg.reply(
        '《✧》 Debes especificar una descripción válida.',
      )

    user.description = input

    await updateUser(msg.sender, 'description', user.description)

    return msg.reply(`✐ Se ha establecido tu descripción:\n> *${user.description}*`)
  },
};