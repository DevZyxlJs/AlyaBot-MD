import axios from 'axios'
import FormData from 'form-data'

function generateUniqueFilename(mime) {
  const ext = mime.split('/')[1] || 'bin'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${id}.${ext}`
}

async function uploadToStellar(buffer, mime, token) {
  const form = new FormData()
  form.append('file', buffer, { filename: generateUniqueFilename(mime) })
  const res = await axios.post(`${api.url}/api/cdn/upload`, form, {
    headers: {
      ...form.getHeaders(),
      'x-upload-token': token
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })
  if (!res.data?.url) throw new Error('Respuesta inválida del CDN')
  return res.data.url
}

export default {
  command: ['seticon'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...global.owner.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)
    const value = args.join(' ').trim()

    if (!value && !m.quoted && !m.message.imageMessage)
      return m.reply('✿ Debes enviar o citar una imagen para cambiar el icon del bot.')

    if (value.startsWith('http')) {
      config.icon = value
      return m.reply(`❖ Se ha actualizado el icon de *${config.namebot2}*!`)
    }

    const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!/image\/(png|jpe?g|gif)/.test(mime))
      return m.reply('❖ Responde a una imagen válida.')

    const media = await q.download()
    if (!media) return m.reply('✿ No se pudo descargar la imagen.')

    try {
      const token = `${api.key2}`
      const link = await uploadToStellar(media, mime, token)
      config.icon = link
      return m.reply(`✿ Se ha actualizado el icon de *${config.namebot2}*!`)
    } catch (e) {
      return m.reply('✿ Falló la subida al CDN.')
    }
  },
}