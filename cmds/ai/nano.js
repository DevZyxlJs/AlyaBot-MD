import axios from 'axios'
import FormData from 'form-data'

function generateUniqueFilename(mime) {
  const ext = mime.split('/')[1] || 'bin'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${id}.${ext}`
}

async function uploadToUguu(buffer, mime) {
  const form = new FormData()
  form.append('files[]', buffer, generateUniqueFilename(mime))

  const res = await axios.post("https://uguu.se/upload.php", form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 30000
  })

  const data = res.data
  const url = data?.files?.[0]?.url
  if (!url) throw new Error("Respuesta inválida de Uguu: " + JSON.stringify(data))
  return url
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
  isSocket: true,
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {

    const q = msg.quoted || msg
    const mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) {
      return sock.reply(
        msg.chat,
        `✿ Por favor, responde a una imagen con el comando *${prefix + command}* y escribe la descripción.`,
        msg
      )
    }

    const prompt = text?.trim() || ' '

    try {
      const media = await q.download()
      const originalUrl = await uploadToUguu(media, mime)
      const bufferNano = await generateNanoFromUrl(originalUrl, prompt)

      await sock.sendMessage(
        msg.chat,
        {
          image: bufferNano,
          caption: null
        },
        { quoted: msg }
      )
    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}