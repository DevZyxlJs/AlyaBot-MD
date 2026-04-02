import yts from 'yt-search'
import fetch from 'node-fetch'
import { getBuffer } from '../../core/message.ts'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  async run(sock, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('《✧》Por favor, menciona el nombre o URL del video que deseas descargar')
      }

      const text = args.join(' ')
      const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
      const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text

      const search = await yts(query)
      const videoInfo = videoMatch
        ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0]
        : search.all[0]

      if (!videoInfo) {
        return m.reply('《✧》 No se encontró información del video.')
      }

      const url = videoInfo.url
      const title = videoInfo.title
      const vistas = (videoInfo.views || 0).toLocaleString()
      const canal = videoInfo.author?.name || 'Desconocido'
      const thumbBuffer = await getBuffer(videoInfo.image)

      const caption = `➥ Descargando › ${title}

> ✿⃘࣪◌ ֪ Canal › ${canal}
> ✿⃘࣪◌ ֪ Duración › ${videoInfo.timestamp || 'Desconocido'}
> ✿⃘࣪◌ ֪ Vistas › ${vistas}
> ✿⃘࣪◌ ֪ Publicado › ${videoInfo.ago || 'Desconocido'}
> ✿⃘࣪◌ ֪ Enlace › ${url}

𐙚 ❀ ｡ ↻ El archivo se está enviando, espera un momento... ˙𐙚`

      await sock.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })

      const endpoint = `${api.url}/dl/ytmp4?url=${encodeURIComponent(url)}&key=${api.key}`
      const res = await fetch(endpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json'
        }
      }).then(r => r.json())

      if (!res?.status || !res.result?.downloadUrl) {
        return m.reply('《✧》 No se pudo descargar el *video*, intenta más tarde.')
      }

const head = await fetch(res.result.downloadUrl, { method: 'HEAD' })
const size = head.headers.get('content-length')
if (size && parseInt(size) > 60 * 1024 * 1024) {
  return m.reply('《✧》 El archivo es demasiado grande para enviarlo.')
}

     const mensaje = {
        video: { url: res.result.downloadUrl },
        fileName: `${res.result.title || 'video'}.mp4`,
        mimetype: 'video/mp4'
      }

      await sock.sendMessage(m.chat, mensaje, { quoted: m })
    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}