import fetch from "node-fetch";
import yts from "yt-search";
import axios from "axios";

const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav'];
const formatVideo = ['360', '480', '720', '1080', '1440', '4k'];

const ddownr = {
  download: async (url, format) => {
    if (!formatAudio.includes(format) && !formatVideo.includes(format)) {
      throw new Error("Formato no soportado, verifica la lista de formatos disponibles.");
    }
    const config = { method: 'GET', url: `https://p.savenow.to/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36' }};
    try {
      const response = await axios.request(config);
      if (response.data && response.data.success) {
        const { id, title, info } = response.data;
        const { image } = info;
        const downloadUrl = await ddownr.cekProgress(id);
        return { id: id, image: image, title: title, downloadUrl: downloadUrl };
      } else {
        throw new Error('Fallo al obtener los detalles del video.');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
  cekProgress: async (id) => {
    const config = { method: 'GET', url: `https://p.savenow.to/ajax/progress.php?id=${id}`, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36' }};
    try {
      while (true) {
        const response = await axios.request(config);
        if (response.data && response.data.success && response.data.progress === 1000) {
          return response.data.download_url;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};

function formatViews(views) {
  try {
    return views >= 1000 ? `${(views / 1000).toFixed(1)}k (${views.toLocaleString()})` : views.toString();
  } catch {
    return "0";
  }
}

export default {
  command: ['play', 'play2', 'mp3', 'yta', 'mp4', 'ytv', 'play3', 'ytadoc', 'playdoc', 'ytmp3doc', 'play4', 'ytvdoc', 'play2doc', 'ytmp4doc'],
  category: 'downloader',
  run: async (client, m, args, command, text) => {
    try {
      if (!text.trim()) return client.reply(m.chat, '✎ Ingresa el nombre de la música a descargar.', m);
      const search = await yts(text);
      if (!search.all?.length) return m.reply('No se encontraron resultados.');
      const videoInfo = search.all.find(v => !!v.ago) || search.all[0];
      const { title, thumbnail, timestamp, views, ago, url } = videoInfo;
      const thumb = (await client.getFile(thumbnail)).data;
      const vistaTexto = formatViews(views);
      const mensaje = `┌──⊰🍁Y O U T U B E🍁⊰
│⊳✍️ Autor: ${title}
│⊳📆 Publicado: ${ago} 
│⊳🕟 Duración: ${timestamp}
│⊳💬 Visitas: ${vistaTexto}
└──────────⊰`;
      await client.reply(m.chat, mensaje, m, {
        contextInfo: {
          externalAdReply: {
            title: "YouTube Download",
            body: dev,
            mediaType: 1,
            previewType: 0,
            mediaUrl: url,
            sourceUrl: url,
            thumbnail: thumb,
            renderLargerThumbnail: true
          }
        }
      });
      if (['play', 'yta', 'mp3', 'ytmp3', 'playaudio'].includes(command)) {
        let sistema = "Stellar";
        try {
          const api = await ddownr.download(url, 'mp3');
          const result = api.downloadUrl;
          await client.sendMessage(m.chat, { audio: { url: result }, mimetype: "audio/mpeg" }, { quoted: m });
        } catch {
          const api = await fetch(`${api.url2}/dl/ytmp3?url=${url}&key=${api.key2}`).then(r => r.json());
          const result = api.data?.dl;
          if (!result) throw new Error();
          await client.sendMessage(m.chat, { audio: { url: result }, fileName: `${api.data.title}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });
        }
      } else if (command === 'play3' || command === 'ytadoc' || command === 'playdoc' || command === 'ytmp3doc') {
        const api = await ddownr.download(url, 'mp3');
        const result = api.downloadUrl;
        await client.sendMessage(m.chat, { document: { url: result }, mimetype: "audio/mpeg", fileName: `${title}.mp3`, caption: `${dev} Aqui tienes tu audio` }, { quoted: m });        
      } else if (['play2', 'ytv', 'mp4', 'play4', 'ytvdoc', 'play2doc', 'ytmp4doc'].includes(command)) {
        const docMode = ['play4', 'ytvdoc', 'play2doc', 'ytmp4doc'].includes(command);
        const fuentes = [
          { sistema: "evogb", url: `${api.url}/dl/ytmp4?url=${encodeURIComponent(url)}&quality=auto&key=${api.key}` },
            { sistema: "sylphy", url: `${api.url3}/download/ytmp4?url=${encodeURIComponent(url)}&q=720p&api_key=${api.key3}` },
          { sistema: "Stellar", url: `${api.url2}/dl/ytmp4?url=${encodeURIComponent(url)}&quality=720&key=${api.key2}` }
          ];
        for (let fuente of fuentes) {
          try {
            const res = await fetch(fuente.url).then(r => r.json());
            const dl = res?.data?.dl || res?.result?.url || res?.data?.dl || res?.result?.download?.url || res?.downloads?.url || res?.data?.download?.url;
            if (dl) {
              const objeto = { [docMode ? 'document' : 'video']: { url: dl }, fileName: `${title}.mp4`, mimetype: 'video/mp4', caption: `✅ ${docMode ? "Documento" : "Video"} ${dev}`, thumbnail: thumb };
              await client.sendMessage(m.chat, objeto, { quoted: m });
              return;
            }
          } catch (error) {
            console.error(`Error con ${fuente.sistema}:`, error.message);
          }
        }
        return m.reply("✱ No se encontró un enlace de descarga válido en ninguna fuente.");
      } else {
        return m.reply("Comando no reconocido.");
      }
    } catch (error) {
      console.error("Error:", error);
      return m.reply(`𓁏 *Error:* ${error}`);
    }
  }
};