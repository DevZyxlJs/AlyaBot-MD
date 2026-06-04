import axios from 'axios';

export default {
  command: ['aptoide', 'apk', 'apkdl'],
  category: 'search',
  run: async ({ msg, sock, args }) => {
    if (!args || !args.length) {
      return msg.reply(
        '✿ Ingresa el *nombre* de la *aplicación*.',
      )
    }

    const query = args.join(' ').trim()

    // await msg.reply(mess.wait)

    try {
      const response = await axios.get(
        `${api.url}/search/apk?query=${encodeURIComponent(query)}&key=${api.key}`,
      )
      const data = response.data.data

      if (data.name && data.dl) {
        const response = `ㅤ۟∩　ׅ　✿　ׅ　🅐pk 🅜od　ׄᰙ　ׅ

𖣣ֶㅤ֯⌗ ❖ ׄ ⬭ *Nombre ›* ${data.name}
𖣣ֶㅤ֯⌗ ❖ ׄ ⬭ *Paquete ›* ${data.package}
𖣣ֶㅤ֯⌗ ❖ ׄ ⬭ *Última actualización ›* ${data.lastUpdated}
𖣣ֶㅤ֯⌗ ❖ ׄ ⬭ *Tamaño ›* ${data.size}`

    await msg.reply(response)

        await sock.sendMessage(
          msg.chat,
          {
            document: { url: data.dl },
            fileName: `${data.name}.apk`,
            mimetype: 'application/vnd.android.package-archive',
            caption: global.dev,
          },
          { quoted: msg },
        )
      } else {
        await sock.reply(msg.chat, `✿ No se encontró la aplicación solicitada.`, msg)
      }
    } catch (error) {
      await msg.reply(msgglobal)
    }
  },
};
