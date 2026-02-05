import { promises as fs } from 'fs';
import fetch from 'node-fetch'

const obtenerImagenGelbooru = async (keyword, name) => {
  const extensionesImagen = /\.(jpg|jpeg|png)$/i;

  try {
    const urlDelirius = `https://api.delirius.store/search/gelbooru?query=${keyword}`;
    const res = await fetch(urlDelirius);
    if (!res.ok) throw new Error(`Delirius HTTP ${res.status}`);
    const data = await res.json();

    const imagenesValidas = data?.data?.filter(item => 
      typeof item?.image === 'string' && extensionesImagen.test(item.image)
    );

    if (imagenesValidas?.length) {
      return imagenesValidas[Math.floor(Math.random() * imagenesValidas.length)].image;
    }
  } catch (err) {
    console.error('Error en Gelbooru (Delirius):', err.message);
  }

  try {
    const urlPinterest = `${api.url}/search/pinterest?query=${name}-Anime&key=${api.key}`;
    const resPinterest = await fetch(urlPinterest);
    if (!resPinterest.ok) throw new Error(`Pinterest HTTP ${resPinterest.status}`);
    const dataPinterest = await resPinterest.json();

    if (dataPinterest?.status !== true) throw new Error("Respuesta no exitosa de Pinterest");
    const imagenesValidas = dataPinterest?.data?.filter(item => 
      typeof item?.hd === 'string' && extensionesImagen.test(item.hd)
    );

    if (imagenesValidas?.length) {
      return imagenesValidas[Math.floor(Math.random() * imagenesValidas.length)].hd;
    }
  } catch (err) {
    console.error('Error en Pinterest (StellarWa):', err.message);
  }

  try {
    const urlStellar = `${api.url}/search/googleimagen?query=${name}-Anime`;
    const resStellar = await fetch(urlStellar);
    if (!resStellar.ok) throw new Error(`StellarWa HTTP ${resStellar.status}`);
    const buffer = await resStellar.buffer();
    return buffer;
  } catch (err) {
    console.error('Error en Google Imágenes (StellarWa):', err.message);
    return null;
  }
};

const charactersFilePath = './lib/characters.json'

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('❀ Error al cargar characters.json:', error)
    throw new Error('❀ No se pudo cargar el archivo characters.json')
  }
}

function findSimilarCharacter(name, characters) {
  name = name.toLowerCase().trim()
  return (
    characters.find((c) => c.name.toLowerCase() === name) ||
    characters.find((c) => c.name.toLowerCase().includes(name)) ||
    characters.find((c) => name.includes(c.name.toLowerCase()))
  )
}

export default {
  command: ['charimage', 'wimage', 'cimage'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(mess.comandooff)

    if (args.length === 0)
      return m.reply(
        `《✤》 Por favor, proporciona el nombre de un personaje.`
      )

    try {
      const characterName = args.join(' ').toLowerCase().trim()
      const characters = await loadCharacters()
      const character = findSimilarCharacter(characterName, characters)

      if (!character)
        return m.reply(`✎ No se ha encontrado el personaje *${characterName}*, ni uno similar.`)

      const message = `➭ Nombre › *${character.name}*

ੈ⚥‧₊˚ Género › *${character.gender}*
ੈ⛁₊˚ Valor › *${character.value.toLocaleString()}*
ੈ❀︎‧₊˚ Fuente › *${character.source}*

${dev}`

const imagen = await obtenerImagenGelbooru(character.keyword, character.name)

if (!imagen) {
  return m.reply(`✐ No se pudo obtener una imagen para *${character.name}*.`)
}

const payload =
  typeof imagen === 'string'
    ? { image: { url: imagen }, caption: message, mimetype: 'image/jpeg' }
    : { image: imagen, caption: message, mimetype: 'image/jpeg' }

await client.sendMessage(chatId, payload, { quoted: m })

    } catch (error) {
      await m.reply(msgglobal)
    }
  },
};
