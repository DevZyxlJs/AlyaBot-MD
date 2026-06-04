import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

async function uploadDix(buffer, mime) {
  const formData = new FormData()
  formData.append('file', new Blob([buffer], { type: mime }), 'icon.' + (mime.split('/')[1] || 'bin'))

  const res = await fetch('https://cdn.dix.lat/upload', {
    method: 'POST',
    body: formData
  })

  const data = await res.json()
  if (!data?.data?.url) throw new Error('No se pudo obtener URL de subida')
  return data.data.url
}

export default {
  command: ['seticon'],
  category: 'socket',
  run: async ({ msg, sock, args }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot)
    const owner = config.owner ? config.owner : '' || ''
    const isOwner2 = [idBot, ...global.mods.map((number) => number + '@s.whatsapp.net')].includes(msg.sender)
    if (!isOwner2 && msg.sender !== owner) return msg.reply(mess.socket)
    const value = args.join(' ').trim()

    if (!value && !msg.quoted && !msg.message.imageMessage)
      return msg.reply('✿ Debes enviar o citar una imagen para cambiar el icon del bot.')

    if (value.startsWith('http')) {
      config.icon = value
      await updateSettings(idBot, 'icon', config.icon)
      return msg.reply(`❖ Se ha actualizado el icon de *${config.namebot2}*!`)
    }

    const q = msg.quoted ? msg.quoted : msg.message.imageMessage ? msg : msg
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!/image\/(png|jpe?g|gif)/.test(mime))
      return msg.reply('❖ Responde a una imagen válida.')

    const media = await q.download()
    if (!media) return msg.reply('✿ No se pudo descargar la imagen.')

    const link = await uploadDix(media, mime)
    config.icon = link

    await updateSettings(idBot, 'icon', config.icon)
    return msg.reply(`✿ Se ha actualizado el icon de *${config.namebot2}*!`)
  },
}
