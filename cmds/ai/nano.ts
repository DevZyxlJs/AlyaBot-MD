import axios from 'axios'
import FormData from 'form-data'

async function uploadToCatbox(buffer, mime) {
  const form = new FormData()
  form.append("userhash", "cdc63d84aafd23061a73d96fb")
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

async function generateNanoFromUrl(url, prompt) {
  const apiUrl = `${api.url}/ai/nanobanana?method=url&url=${encodeURIComponent(url)}&prompt=${encodeURIComponent(prompt)}&key=${api.key}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer' })
  if (!res.data) {
    throw new Error('Respuesta inválida del servidor de NanoBanana')
  }
  return Buffer.from(res.data)
}

export default {
  command: ['nano', 'nanobanana'],
  category: 'ai',
  run: async (sock, m, args, command, text, prefix) => {

    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) {
      return sock.reply(
        m.chat,
        `✿ Por favor, responde a una imagen con el comando *${prefix + command}* y escribe la descripción.`,
        m
      )
    }

    const prompt = text?.trim() || ' '

    try {
      const media = await q.download()
      const originalUrl = await uploadToCatbox(media, mime)
      const bufferNano = await generateNanoFromUrl(originalUrl, prompt)

      await sock.sendMessage(
        m.chat,
        {
          image: bufferNano,
          caption: null
        },
        { quoted: m }
      )

    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}