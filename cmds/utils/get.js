import fetch from 'node-fetch'
import { format } from 'util'
import crypto from 'crypto'

export default {
  command: ['get'],
  category: 'utils',
  run: async ({ msg, sock, args }) => {
    const text = args[0]
    if (!text) return msg.reply('✎ Ingresa un enlace para realizar la solicitud.')

    if (!/^https?:\/\//.test(text))
      return msg.reply('✿ Ingresa un enlace válido que comience en *https://* o *http://*')

    try {
      const response = await fetch(text)
      const contentType = response.headers.get('content-type') || ''
      const contentLength = parseInt(response.headers.get('content-length') || '0')
      const ext = text.split('.').pop().toLowerCase()

      if (contentLength > 100 * 1024 * 1024) {
        throw new Error(`Archivo demasiado grande: ${contentLength} bytes`)
      }

      const buffer = await response.buffer()

      if (/image\/(jpeg|png|gif|webp)/.test(contentType) || ['jpg','jpeg','png','gif','webp'].includes(ext)) {
        return await sock.sendMessage(msg.chat, { image: buffer }, { quoted: msg })
      }

      if (/video\/(mp4|webm|ogg)/.test(contentType) || ['mp4','webm','ogg'].includes(ext)) {
        return await sock.sendMessage(msg.chat, { video: buffer }, { quoted: msg })
      }

      if (/audio\/(mpeg|ogg|mp3|wav)/.test(contentType) || ['mp3','wav','ogg'].includes(ext) || contentType === 'application/octet-stream') {
        const mime = contentType.startsWith('audio/') ? contentType : 'audio/mpeg'
        return await sock.sendMessage(msg.chat, { audio: buffer, mimetype: mime }, { quoted: msg })
      }

      let content = buffer.toString()
      try {
        const parsed = JSON.parse(content)
        return await sock.sendCodeMessage(
          msg.chat,
          `Respuesta JSON de ${text}`,
          format(parsed),
          msg,
          {
            title: 'Respuesta JSON',
            headers: ['Campo', 'Valor'],
            rows: Object.entries(parsed).map(([k,v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)])
          }
        )
      } catch (e) {
        return await sock.sendCodeMessage(
          msg.chat,
          `Respuesta de ${text}`,
          content,
          msg
        )
      }

    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}