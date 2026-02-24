import yts from 'yt-search'
import fetch from 'node-fetch'
import { getBuffer } from '../../lib/message.js'

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

      await client.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })

      const endpoint = `${api.url}/dl/youtube?url=${encodeURIComponent(url)}&key=${api.key}`
      const res = await fetch(endpoint).then(r => r.json())

      if (!res?.success || !res.results) {
        return m.reply('《✧》 No se pudo descargar el *video*, intenta más tarde.')
      }

      const videoFormat = res.results.formats.find(f => f.type === 'video' && f.quality === '360p') || res.results.formats.find(f => f.type === 'video')
      if (!videoFormat?.url) {
        return m.reply('《✧》 No se encontró un formato de video válido.')
      }

      const videoBuffer = await getBuffer(videoFormat.url)
      let mensaje

        mensaje = {
          video: videoBuffer,
          fileName: `${title || 'video'}.mp4`,
          mimetype: 'video/mp4'
        }

      await client.sendMessage(m.chat, mensaje, { quoted: m })
    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}