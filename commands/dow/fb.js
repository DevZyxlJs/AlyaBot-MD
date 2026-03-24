import { fbDownloader } from 'cloudst'
import { getBuffer } from '../../lib/message.js'

export default {
  command: ['fb', 'facebook'],
  category: 'downloader',
  run: async (client, m, args) => {
    if (!args.length) {
      return m.reply('✎ Ingrese un enlace de *Facebook*')
    }

    const url = args.find(arg => arg.match(/facebook\.com|fb\.watch|video\.fb\.com/))
    if (!url) {
      return m.reply('✿ Por favor, envía un link de Facebook válido')
    }

    try {
      const results = await fbDownloader(url)
      if (!results || !Array.isArray(results) || !results.length) {
        return m.reply('✿ No se pudo obtener el video de Facebook.')
      }

      const best = results[0]
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
    } catch (e) {
      await m.reply(e)
    }
  }
}
