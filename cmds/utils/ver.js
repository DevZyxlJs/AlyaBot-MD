import fetch from 'node-fetch'

export default {
  command: ['reveal', 'viewonce', 'ver'],
  category: 'utils',
  run: async ({ msg, sock, args }) => {
    try {
      if (!msg.quoted) {
        return msg.reply('《✧》 Responde al mensaje de "Ver una sola vez" que quieres revelar.')
      }

      const quoted = msg.quoted

      let mediaBuffer = null
      let mimeType = quoted.mime || quoted.mimetype || ''
      let mediaType = quoted.type || 'imageMessage'

      if (typeof quoted.download === 'function') {
        try {
          mediaBuffer = await quoted.download()
        } catch (err) {
          console.log('Error en download:', err.message)
        }
      }

      if (!mediaBuffer && quoted.mediaBuffer) {
        mediaBuffer = quoted.mediaBuffer
        if (typeof mediaBuffer === 'string') {
          mediaBuffer = Buffer.from(mediaBuffer, 'base64')
        }
      }

      if (!mediaBuffer || mediaBuffer.length === 0) {
        return msg.reply('《✧》 No se pudo obtener el contenido. El mensaje pudo haber expirado.')
      }

      let esVideo = false
      let esImagen = false
      let esAudio = false

      if (mimeType.includes('video/')) {
        esVideo = true
      } else if (mimeType.includes('image/')) {
        esImagen = true
      } else if (mimeType.includes('audio/')) {
        esAudio = true
      }

      if (mediaType === 'videoMessage') {
        esVideo = true
      } else if (mediaType === 'imageMessage') {
        esImagen = true
      } else if (mediaType === 'audioMessage') {
        esAudio = true
      }

      if (!esVideo && !esImagen && !esAudio && mediaBuffer.length > 4) {
        const isPNG = mediaBuffer[0] === 0x89 && mediaBuffer[1] === 0x50
        const isJPEG = mediaBuffer[0] === 0xFF && mediaBuffer[1] === 0xD8
        const isMP4 = mediaBuffer[0] === 0x00 && mediaBuffer[1] === 0x00 && mediaBuffer[2] === 0x00 && mediaBuffer[3] === 0x1C
        const isWEBP = mediaBuffer[0] === 0x52 && mediaBuffer[1] === 0x49 && mediaBuffer[2] === 0x46 && mediaBuffer[3] === 0x46

        if (isMP4) esVideo = true
        else if (isPNG || isJPEG) esImagen = true
        else if (isWEBP) esImagen = true
      }

      const tamañoKB = (mediaBuffer.length / 1024).toFixed(2)

      if (esVideo) {
        await sock.sendMessage(msg.chat, {
          video: mediaBuffer,
          caption: null
        }, { quoted: msg })

      } else if (esImagen) {
        await sock.sendMessage(msg.chat, {
          image: mediaBuffer,
          caption: null
        }, { quoted: msg })


      } else if (esAudio) {
        await sock.sendMessage(msg.chat, {
          audio: mediaBuffer,
          mimetype: 'audio/mp4',
          ptt: true
        }, { quoted: msg })

       // await msg.reply('✎ Nota de voz revelada correctamente.')

      } else {
        await sock.sendMessage(msg.chat, {
          document: mediaBuffer,
          mimetype: mimeType || 'application/octet-stream',
          fileName: `viewonce_${Date.now()}.${mimeType.split('/')[1] || 'bin'}`
        }, { quoted: msg })

       // await msg.reply('✎ Archivo revelado correctamente.')
      }

    } catch (e) {
      // console.error('Error completo:', e)
      return msg.reply(msgglobal)
    }
  }
}