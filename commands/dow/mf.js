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
      m.react('⏱️')

      const res = await mediafiredl(url)

      if (!res || !res.download) {
        return client.reply(m.chat, '✎ No se pudo obtener una *descarga* válida.')
      }

      const info = `✎ *Archivo encontrado*\n\n` +
        `> • *Nombre ::* ${res.filename}\n` +
        `> • *Tipo ::* ${res.filetype}\n` +
        `> • *Tamaño ::* ${res.filesize}\n` +
        `> • *Subido ::* ${res.uploaded}`

    await client.sendContextInfoIndex(m.chat, info, {}, m, true)

      await client.sendMessage(
        m.chat,
        {
          document: { url: res.download },
          mimetype: 'application/octet-stream',
          fileName: res.filename,
        },
        { quoted: m },
      )
    m.reply('✅')
    } catch (error) {
      m.reply('❌')
      console.error(error)
      await m.reply('✎ Hubo un problema al procesar tu enlace de Mediafire.')
    }
  },
}