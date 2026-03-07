import axios from 'axios'
import FormData from 'form-data'

async function uploadToServer(buffer, mime) {
  const form = new FormData()
  form.append('file', buffer, { filename: 'temp.png' })
  const res = await axios.post(`https://bot.stellarwa.xyz/upload`, form, {
    headers: {
      ...form.getHeaders(),
      'Content-Type': 'multipart/form-data'
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })
  if (!res.data?.status || !res.data?.url) {
    throw new Error('Respuesta inválida del servidor: ' + JSON.stringify(res.data))
  }
  return res.data.url
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
  run: async (client, m, args, command, text, prefix) => {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) {
      return client.reply(
        m.chat,
        `✿ Por favor, responde a una imagen con el comando *${prefix + command}* para removerle el fondo.`,
        m
      )
    }

    try {
      const media = await q.download()

      const originalUrl = await uploadToServer(media, mime)

      const bufferNoBg = await removeBgFromUrl(originalUrl)

      await client.sendMessage(m.chat, { image: bufferNoBg }, { quoted: m })

    } catch (e) {
      await m.reply(`${msgglobal}`)
    }
  }
}