import { mediafiredl } from 'cloudst'

export default {
  command: ['mediafire', 'mf'],
  category: 'downloader',
  run: async (client, m, args, command) => {
    const url = args[0]?.trim()

    if (!url) {
      return m.reply(`✎ Escriba un *enlace de Mediafire* para descargar.`)
    }

    try {
      const txc = `✎ Procesando tu enlace de *Mediafire*...`
      const { key } = await client.sendMessage(
        m.chat,
        { text: txc },
        { quoted: m },
      )

      const res = await mediafiredl(url)

      if (!res || !res.download) {
        return client.reply(m.chat, '✎ No se pudo obtener una *descarga* válida.')
      }

      const response = `✎ *Archivo encontrado*\n\n` +
        `• Nombre: ${res.filename}\n` +
        `• Tipo: ${res.filetype}\n` +
        `• Tamaño: ${res.filesize}\n` +
        `• Subido: ${res.uploaded}\n\n` +
        `⇲ Descarga: ${res.download}`

      await client.sendMessage(m.chat, { text: response, edit: key })
    } catch (error) {
      console.error(error)
      await m.reply('✎ Hubo un problema al procesar tu enlace de Mediafire.')
    }
  },
}