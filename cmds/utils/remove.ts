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

async function removeBgFromUrl(url) {
  const apiUrl = `${api.url}/tools/removebg?method=url&url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer' })
  if (!res.data) {
    throw new Error('Respuesta inválida del servidor de removebg')
  }
  return Buffer.from(res.data)
}

export default {
  command: ['removebg'],
  category: 'utils',
  async run(sock, m, args, command, text, prefix) {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) {
      return sock.reply(
        m.chat,
        `✿ Por favor, responde a una imagen con el comando *${prefix + command}* para removerle el fondo.`,
        m
      )
    }

    try {
      const media = await q.download()

      const originalUrl = await uploadToCatbox(media, mime)

      const bufferNoBg = await removeBgFromUrl(originalUrl)

      await sock.sendMessage(m.chat, { image: bufferNoBg }, { quoted: m })

    } catch (e) {
      await m.reply(`${msgglobal}`)
    }
  }
}