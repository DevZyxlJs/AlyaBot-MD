import fetch from 'node-fetch';

export default {
  command: ['mf', 'mediafire'],
  category: 'downloader',
  run: async (sock, m, args) => {
    try {
      let text = args.join(' ')
      if (!text) return m.reply('✐ Ingresa una URL de Mediafire.');
      if (!/^https?:\/\/(www\.)?mediafire\.com/.test(text)) {
        return m.reply('✦ Solo se aceptan enlaces de Mediafire.');
      }

      const apiUrl = `${api.url}/dl/mediafire?url=${encodeURIComponent(text)}&key=${api.key}`;
      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json.status) return m.reply('✦ No se pudo obtener el archivo.');

      const { filename, filetype, filesize, uploaded, download } = json.result;

      let info = `˚ʚ♡ɞ₊ *MEDIAFIRE - DL* ෆ╹ .̮ ╹ෆ\n\n`;
      info += `➩ Descargando › *${filename}*\n`;
      info += `> ❖ Tipo › *${filetype}*\n`;
      info += `> ❖ Tamaño › *${filesize}*\n`;
      info += `> ❖ Subido › *${uploaded}*\n\n`;
      info += `⇢ Descargando y enviando archivo...`;

    await sock.sendContextInfoIndex(m.chat, info, {}, m, true)

      await sock.sendMessage(
        m.chat,
        {
          document: { url: download },
          mimetype: 'application/octet-stream',
          fileName: filename,
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      m.reply(msgglobal);
    }
  },
};