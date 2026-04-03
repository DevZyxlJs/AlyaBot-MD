import axios from 'axios'
import FormData from 'form-data'

async function uploadToCatbox(buffer, mime) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, { filename: 'temp.png', contentType: mime })

  const res = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })

  if (typeof res.data !== 'string' || !res.data.startsWith('https://')) {
    throw new Error('Respuesta inválida de Catbox: ' + JSON.stringify(res.data))
  }
  return res.data.trim()
}

async function removeNsfwFromUrl(url) {
  const apiUrl = `${api.url}/nsfw/remover?method=url&url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer' })
  if (!res.data) {
    throw new Error('Respuesta inválida del servidor NSFW Remover')
  }
  return Buffer.from(res.data)
}

export default {
  command: ['removerprendas', 'desnudar'],
  category: 'nsfw',
  run: async (sock, m, args, command, text, prefix) => {

     const chat = await getChat(m.chat)

    if (!chat.nsfw)
      return m.reply(
        mess.nsfw,
      )

    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) {
      return sock.reply(
        m.chat,
        `✿ Por favor, responde a una imagen con el comando *${prefix + command}* para quitar su ropa.`,
        m
      )
    }

    try {
      const media = await q.download()
      const originalUrl = await uploadToCatbox(media, mime)
      const bufferClean = await removeNsfwFromUrl(originalUrl)

      await sock.sendMessage(
        m.chat,
        {
          image: bufferClean,
          caption: null
        },
        { quoted: m }
      )

    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}