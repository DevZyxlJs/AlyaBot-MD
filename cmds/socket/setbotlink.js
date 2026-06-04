import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setlink', 'setbotlink'],
  category: 'socket',
  run: async ({ msg, sock, args }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot)
    const owner = config.owner ? config.owner : '' || ''
    const isOwner2 = [idBot, ...global.mods.map((number) => number + '@s.whatsapp.net')].includes(msg.sender)
    if (!isOwner2 && msg.sender !== owner) return msg.reply(mess.socket)

    const value = args.join(' ').trim()
    if (!value) {
      return msg.reply(`✿ Ingresa un enlace válido que comience con http:// o https://`)
    }

    if (!/^https?:\/\//i.test(value)) {
      return msg.reply('✿ El enlace debe comenzar con http:// o https://')
    }

    config.link = value

    await updateSettings(idBot, 'link', config.link)
    return msg.reply(`✎ Se cambió el enlace del Socket correctamente.`)
  },
};