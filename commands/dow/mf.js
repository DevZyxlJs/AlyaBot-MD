import { mediafiredl } from 'cloudst'

export default {
  command: ['mediafire', 'mf'],
  category: 'downloader',
  run: async (client, m, args, command) => {
    const url = args[0]?.trim()

    if (!url || !url.includes('mediafire.com')) {
      return m.reply(`✎ Escriba un *enlace válido de Mediafire* para descargar.`)
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

      const info = `✎ *Archivo encontrado*\n\n` +
        `> • *Nombre ::* ${res.filename}\n` +
        `> • *Tipo ::* ${res.filetype}\n` +
        `> • *Tamaño ::* ${res.filesize}\n` +
        `> • *Subido ::* ${res.uploaded}`

      await client.sendMessage(m.chat, { text: info, edit: key })

      await client.sendMessage(
        m.chat,
        {
          document: { url: res.download },
          mimetype: 'application/octet-stream',
          fileName: res.filename,
        },
        { quoted: m },
      )
    } catch (error) {
      console.error(error)
      await m.reply('✎ Hubo un problema al procesar tu enlace de Mediafire.')
    }
  },
}