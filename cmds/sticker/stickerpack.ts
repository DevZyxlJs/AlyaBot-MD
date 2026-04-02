import axios from 'axios';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const toBuffer = async (url) => Buffer.from((await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data);
const key = api.key;

const isStickerUrl = (url) => {
  return /^(https?:\/\/)?(www\.)?sticker\.ly\/s\/[a-zA-Z0-9]+$/i.test(url);
};

const searchPacks = async (query, attempt = 1) => {
  try {
    const { data } = await axios.get(`${api.url}/stickerly/search`, { params: { query, key }, timeout: 10000 });
    return data;
  } catch (e) {
    if (e.response?.status === 429 && attempt <= 3) {
      await delay((e.response.headers['retry-after'] || 5) * 1000);
      return searchPacks(query, attempt + 1);
    }
    throw e;
  }
};

const downloadPack = async (url, attempt = 1) => {
  try {
    const { data } = await axios.get(`${api.url}/stickerly/detail`, { params: { url, key }, timeout: 10000 });
    return data;
  } catch (e) {
    if (e.response?.status === 429 && attempt <= 3) {
      await delay((e.response.headers['retry-after'] || 5) * 1000);
      return downloadPack(url, attempt + 1);
    }
    if (e.response?.status === 500) return { status: false, error: 500 };
    throw e;
  }
};

const filterRelevantPacks = (packs, query) => {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return packs;
  return packs.filter(pack => {
    const packName = (pack.name || '').toLowerCase();
    return packName.includes(searchTerm);
  });
};

export default {
  command: ['stickerpack', 'spack'],
  category: 'stickers',
  async run(sock, m, args, command, text, prefix) {
    try {
      if (!text) return sock.reply(m.chat, `《✧》 Ingresa un texto para buscar packs de stickers o una URL de sticker.ly.`, m);
      const name = await getUser(m.sender).name || m.sender.split('@')[0];
      let packData;
      const stickerMatch = text.match(/(?:sticker\.ly\/s\/)([a-zA-Z0-9]+)(?:\s|$)/);
      const url = stickerMatch ? 'https://sticker.ly/s/' + stickerMatch[1] : (isStickerUrl(text) ? text : null);

      if (url) {
        let detail = await downloadPack(url);
        if (!detail || !detail.status || detail.error === 500) {
          return sock.reply(m.chat, `《✧》 El pack de la URL no está disponible o es privado.`, m);
        }
        if (!detail.detalles) return sock.reply(m.chat, `《✧》 No se pudo obtener el pack desde la URL.`, m);
        packData = detail.detalles;
      } else {
        const search = await searchPacks(text);
        if (!search.status || !search.resultados?.length) return sock.reply(m.chat, `《✧》 No se encontraron packs para *${text}*.`, m);
        const relevantPacks = filterRelevantPacks(search.resultados, text);
        let packsToTry = relevantPacks.length > 0 ? relevantPacks : search.resultados;
        let detail = null;
        let intentos = 0;
        const maxIntentos = Math.min(packsToTry.length, 5);
        const indices = [...Array(packsToTry.length).keys()];
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        while (intentos < maxIntentos && !detail) {
          const index = indices[intentos];
          const res = await downloadPack(packsToTry[index].url);
          if (res?.status && res?.detalles?.stickers?.length > 0) {
            detail = res.detalles;
            break;
          }
          intentos++;
        }
        if (!detail) {
          return sock.reply(m.chat, `《✧》 No se pudo descargar ningún pack válido.`, m);
        }
        packData = detail;
      }

      const { name: packName, author, stickers } = packData;
      if (!stickers?.length) {
        return sock.reply(m.chat, `《✧》 El pack no contiene stickers válidos.`, m);
      }

      const MAX_STICKERS = 30;
      const selectedStickers = stickers.slice(0, MAX_STICKERS);

      await sock.sendMessage(m.chat, {
        stickerPack: {
          name: packName,
          publisher: author?.name || author?.username || `@${name}`,
          description: 'Sᴛᴇʟʟᴀʀ 🧠 Wᴀʙᴏᴛ',
          stickers: selectedStickers.map(s => ({
            url: s.imageUrl,
            isAnimated: s.isAnimated || false,
            emojis: ['🎭']
          }))
        }
      }, { quoted: m });
    } catch (e) {
      return m.reply(msgglobal);
    }
  }
};