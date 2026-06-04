import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

let proposals = {}

export default {
  command: ['marry'],
  category: 'profile',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    const proposer = msg.sender
    const mentioned = msg.mentionedJid
    const proposee = mentioned.length > 0 ? mentioned[0] : (msg.quoted ? msg.quoted.sender : false)
    if (!proposee) return msg.reply('《✤》 Menciona al usuario al que deseas proponer matrimonio.')

    if (proposer === proposee)
      return msg.reply('「✿」 No puedes proponerte matrimonio a ti mismo.')

    const proposerData = await getUser(proposer)
    const proposeeData = await getUser(proposee)

    if (proposerData?.marry)
      return msg.reply(`✐ Ya estás casado con *${getUser(proposerData.marry)?.name || 'alguien'}*.`)

    if (proposeeData?.marry)
      return msg.reply(`✎ *${proposeeData.name || proposee.split('@')[0]}* ya está casado con *${getUser(proposeeData.marry)?.name || 'alguien'}*.`)

    setTimeout(() => {
      delete proposals[proposer]
    }, 120000)

    if (proposals[proposee] === proposer) {
      delete proposals[proposee]

      proposerData.marry = proposee
      proposeeData.marry = proposer

      await updateUser(msg.sender, 'marry', proposerData.marry)
      await updateUser(proposee, 'marry', proposeeData.marry)
     return msg.reply(`✐ Felicidades, *${proposerData.name || proposer.split('@')[0]}* y *${proposeeData.name || proposee.split('@')[0]}* ahora están casados.`)
    } else {
      proposals[proposer] = proposee
      return sock.reply(
        chatId,
        `✎ @${proposee.split('@')[0]}, el usuario @${proposer.split('@')[0]} te ha enviado una propuesta de matrimonio.\n\n⚘ *Responde con:*\n> ❀ *_marry @${proposer.split('@')[0]}_* para confirmar.\n> ❀ La propuesta expirará en 2 minutos.`,
        msg,
        { mentions: [proposer, proposee] }
      )
    }
  }
}