import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

async function uploadDix(fileBuffer, mime) {
  const formData = new FormData()
  formData.append('file', new Blob([fileBuffer], { type: mime }), 'upload.' + mime.split('/')[1])

  const res = await fetch('https://cdn.dix.lat/upload', {
    method: 'POST',
    body: formData
  })

  const data = await res.json()
  if (!data?.data?.url) throw new Error('No se pudo obtener URL de subida')
  return data.data.url
}

export default {
  command: ['setbanner', 'setmenubanner'],
  category: 'socket',
  run: async ({ msg, sock, args }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot)
    const owner = config.owner ? config.owner : '' || ''
    const isOwner2 = [idBot, ...global.mods.map((number) => number + '@s.whatsapp.net')].includes(msg.sender)
    if (!isOwner2 && msg.sender !== owner) return msg.reply(mess.socket)
    const value = args.join(' ').trim()

    if (!value && !msg.quoted && !msg.message.imageMessage && !msg.message.videoMessage)
      return msg.reply('❖ Debes enviar o citar una imagen o video para cambiar el banner del bot.')

    if (value.startsWith('http')) {
      config.banner = value
      await updateSettings(idBot, 'banner', config.banner)
      return msg.reply(`❖ Se ha actualizado el banner de *${config.namebot2}*!`)
    }

    const q = msg.quoted ? msg.quoted : msg.message.imageMessage ? msg : msg
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime))
      return msg.reply('✿ Responde a una imagen o video válido.')

    const media = await q.download()
    if (!media) return msg.reply('❀ No se pudo descargar el archivo.')

    const link = await uploadDix(media, mime)
    config.banner = link

    await updateSettings(idBot, 'banner', config.banner)
    return msg.reply(`❖ Se ha actualizado el banner de *${config.namebot2}*!`)
  },
}
