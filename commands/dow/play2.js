import yts from 'yt-search'
import fetch from 'node-fetch'
import { getBuffer } from '../../lib/message.js'
import sharp from 'sharp'

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('《✧》Por favor, menciona el nombre o URL del video que deseas descargar')
      }
      const text = args.join(' ')
      const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
      const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
      let url = query, title = null, thumbBuffer = null
      try {
        const search = await yts(query)
        if (search.all.length) {
          const videoInfo = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
          if (videoInfo) {
            url = videoInfo.url
            title = videoInfo.title
            thumbBuffer = await getBuffer(videoInfo.image)
            const vistas = (videoInfo.views || 0).toLocaleString()
            const canal = videoInfo.author?.name || 'Desconocido'
        const caption = `➥ Descargando › ${title}

> ✿⃘࣪◌ ֪ Canal › ${canal}
> ✿⃘࣪◌ ֪ Duración › ${videoInfo.timestamp || 'Desconocido'}
> ✿⃘࣪◌ ֪ Vistas › ${vistas}
> ✿⃘࣪◌ ֪ Publicado › ${videoInfo.ago || 'Desconocido'}
> ✿⃘࣪◌ ֪ Enlace › ${url}

𐙚 ❀ ｡ ↻ El archivo se está enviando, espera un momento... ˙𐙚`
            await client.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })
          }
        }
      } catch (err) {
      }
      const video = await getVideoFromApis(url)
      if (!video?.url) {
        return m.reply('《✧》 No se pudo descargar el *video*, intenta más tarde.')
      }
      const videoBuffer = await getBuffer(video.url)
      const enviarComoDocumento = Math.random() < 0.4
      let mensaje
      if (enviarComoDocumento && thumbBuffer && title) {
        const thumbBuffer2 = await sharp(thumbBuffer).resize(300, 300).jpeg({ quality: 80 }).toBuffer()
        mensaje = { document: videoBuffer, mimetype: 'video/mp4', fileName: `${title}.mp4`, jpegThumbnail: thumbBuffer2 }
      } else {
        mensaje = { video: videoBuffer, fileName: `${title || 'video'}.mp4`, mimetype: 'video/mp4' }
      }
      await client.sendMessage(m.chat, mensaje, { quoted: m })
    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}

async function getVideoFromApis(url) {
  const apis = [
    { api: 'Adonix', endpoint: `${global.APIs.adonix.url}/download/ytvideo?apikey=${global.APIs.adonix.key}&url=${encodeURIComponent(url)}`, extractor: res => res?.data?.url },
    { api: 'Nexevo', endpoint: `https://nexevo-api.vercel.app/download/y2?url=${encodeURIComponent(url)}`, extractor: res => res.result?.url },
    { api: 'Sylphy', endpoint: `${global.APIs.sylphy.url}/download/ytmp4?url=${encodeURIComponent(url)}&q=360p&api_key=${global.APIs.sylphy.key}`, extractor: res => res.result?.url }, 
    { api: 'Stellar', endpoint: `${global.api.url}/dl/ytmp4?url=${encodeURIComponent(url)}&quality=144&key=${global.api.key}`, extractor: res => res.data?.dl }
  ]

  for (const { api, endpoint, extractor } of apis) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json())
      clearTimeout(timeout)
      const link = extractor(res)
      if (link) return { url: link, api }
    } catch (e) {}
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return null
}