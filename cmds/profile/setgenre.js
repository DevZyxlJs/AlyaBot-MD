import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setgenre'],
  category: 'profile',
    run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const user = await getUser(msg.sender)
    const input = args.join(' ').toLowerCase()

    if (user.genre)
      return msg.reply(`ꕥ Ya tienes un género. Usa › *${prefix + command}* para eliminarlo.`)

    if (!input)
      return msg.reply(
        '《✧》 Debes ingresar un género válido.',
      )

    const genre = input === 'hombre' ? 'Hombre' : input === 'mujer' ? 'Mujer' : null
    if (!genre) return msg.reply(`《✧》 Elije un genero valido.`)

    user.genre = genre

    await updateUser(msg.sender, 'genre', user.genre)

    return msg.reply(`✎ Se ha establecido tu género como: *${user.genre}*`)
  },
};