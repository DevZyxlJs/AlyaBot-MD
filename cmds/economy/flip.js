import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['cf', 'flip', 'coinflip'],
  category: 'rpg',
    run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chat = await getChat(msg.chat)
    const user = await getChatUser(msg.chat, msg.sender)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const monedas = botSettings.currency

    if (chat.adminonly || !chat.rpg)
      return msg.reply(mess.comandooff)

    const cantidad = parseInt(args[0])
    const eleccion = args[1]?.toLowerCase()

    if (!eleccion || isNaN(cantidad)) {
      return msg.reply(
        `✎ Elige una opción ( *Cara o Cruz* ) y la cantidad a apostar, para lanzar la moneda.\n\n\`Ejemplo\`\n> *${prefix + command}* 2000 cara`,
      )
    }

    if (!['cara', 'cruz'].includes(eleccion)) {
      return msg.reply(
        `「✿」 Elección no válida. Por favor, elige cara o cruz.`,
      )
    }

    if (cantidad <= 199) {
      return msg.reply(
        `《✤》 Por favor, elige una cantidad mayor a 200 ${monedas} para apostar.`,
      )
    }

    if (user.coins < cantidad) {
      return msg.reply(`《✤》 No tienes suficientes *${monedas}* para apostar.`)
    }

    const resultado = Math.random() < 0.5 ? 'cara' : 'cruz'
    const cantidadFormatted = cantidad.toLocaleString()
    let mensaje = `ꕥ La moneda ha caído en *${resultado}*.\n`

    if (resultado === eleccion) {
      user.coins += cantidad

   await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
      mensaje += `¡Has ganado *¥${cantidadFormatted} ${monedas}*!`
    } else {
      user.coins -= cantidad

   await updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
      mensaje += `Has perdido *¥${cantidadFormatted} ${monedas}*.`
    }

    await sock.reply(msg.chat,  mensaje, msg)
  },
};
