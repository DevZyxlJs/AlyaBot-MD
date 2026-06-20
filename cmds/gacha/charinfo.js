import db from "#db"
import { promises as fs } from 'fs';
import fetch from 'node-fetch';

const obtenerImagen = async (keyword) => {
  const endpoints = ["safebooru", "gelbooru", "danbooru"];

  for (const endpoint of endpoints) {
    try {
      const url = `${api.url}/nsfw/${endpoint}?keyword=${keyword}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${endpoint} HTTP ${res.status}`);

      const buffer = await res.arrayBuffer();

      if (buffer.byteLength > 0) {
        return Buffer.from(buffer);
      }
    } catch (err) {
      console.error(`Error en ${endpoint}:`, err.message);
    }
  }

  return null;
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
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    
    const chatConfig = await db.getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return msg.reply(mess.comandooff)

    if (args.length === 0)
      return msg.reply(`《✤》 Por favor, proporciona el nombre de un personaje.`)

    try {
      const characterName = args.join(' ').toLowerCase().trim()
      const characters = await loadCharacters()
      const character = findSimilarCharacter(characterName, characters)

      if (!character)
        return msg.reply(`✎ No se ha encontrado el personaje *${characterName}*, ni uno similar.`)

      const message = `➭ Nombre › *${character.name}*

ੈ⚥‧₊˚ Género › *${character.gender}*
ੈ⛁₊˚ Valor › *${character.value.toLocaleString()}*
ੈ❀︎‧₊˚ Fuente › *${character.source}*

${dev}`

const imagen = await obtenerImagen(character.keyword, character.name);

if (!imagen) {
  return msg.reply(`✐ No se pudo obtener una imagen para *${character.name}*.`);
}

const payload = {
  image: imagen, 
  caption: message, 
  mimetype: 'image/jpeg'
};

await sock.sendMessage(chatId, payload, { quoted: msg });

    } catch (error) {
      console.error(error)
      await msg.reply(msgglobal)
    }
  },
}
