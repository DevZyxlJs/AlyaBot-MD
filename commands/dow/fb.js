import { fbDownloader } from 'cloudst'
import { getBuffer } from '../../lib/message.js'

export default {
  command: ['fb', 'facebook'],
  category: 'downloader',
  run: async (client, m, args) => {
    if (!args.length) {
      return m.reply('✎ Ingrese uno o varios enlaces de *Facebook*')
    }

    const urls = args.filter(arg => arg.match(/facebook\.com|fb\.watch|video\.fb\.com/))
    if (!urls.length) {
      return m.reply('✿ Por favor, envía un link de Facebook válido')
    }

    try {
      if (urls.length > 1) {
        const medias = []
        for (const url of urls.slice(0, 10)) {
          try {
            const results = await fbDownloader(url)
            if (!results || !Array.isArray(results) || !results.length) continue

            const best = results[results.length - 1]
            if (!best?.url) continue

            const buffer = await getBuffer(best.url)
            if (!buffer) continue

            medias.push({
              type: 'video',
              data: buffer
            })
          } catch {
            continue
          }
        }

        if (medias.length) {
          await client.sendAlbumMessage(m.chat, medias, { quoted: m })
        } else {
          await m.reply(`✿ No se pudieron procesar los enlaces.`)
        }
      } else {
        const url = urls[0]
        const results = await fbDownloader(url)
        if (!results || !Array.isArray(results) || !results.length) {
          return m.reply('✿ No se pudo obtener el video de Facebook.')
        }

        const best = results[results.length - 1]
        if (!best?.url) {
          return m.reply('✿ No se encontró un enlace válido.')
        }

        const buffer = await getBuffer(best.url)
        if (!buffer) {
          return m.reply('✿ Error al descargar el video.')
        }

        await client.sendMessage(
          m.chat,
          { video: buffer, mimetype: 'video/mp4', fileName: 'fb.mp4' },
          { quoted: m }
        )
      }
    } catch (e) {
      await m.reply(e)
    }
  }
}