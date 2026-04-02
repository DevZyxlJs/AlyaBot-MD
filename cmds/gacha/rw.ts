import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

const obtenerImagen = async (keyword) => {
  const endpoints = ["gelbooru", "safebooru", "danbooru"];

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

const obtenerPersonajes = () => {
  try {
    const contenido = fs.readFileSync('./core/characters.json', 'utf-8')
    return JSON.parse(contenido)
  } catch (error) {
    console.error('[Error] characters.json:', error)
    return []
  }
}

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const s = seconds.toString().padStart(2, '0')
  const m = minutes.toString().padStart(2, '0')
  return m === '00'
    ? `${s} segundo${s > 1 ? 's' : ''}`
    : `${m} minuto${m > 1 ? 's' : ''}, ${s} segundo${s > 1 ? 's' : ''}`
}

export default {
  command: ['rollwaifu', 'roll', 'rw', 'rf'],
  category: 'gacha',
  run: async (client, m, args) => {
    const chatId = m.chat
    const userId = m.sender
    const chat = await getChat(chatId)
    const user = await getUser(userId)
    const chatUser = await getChatUser(chatId, userId)
    const now = Date.now()

    if (chat.adminonly || !chat.gacha)
      return m.reply(mess.comandooff)

    const cooldown = chatUser.rwCooldown || 0
    const restante = cooldown - now
    if (restante > 0) {
      return m.reply(`✎ Espera *${msToTime(restante)}* para volver a usar este comando.`)
    }

    const personajes = obtenerPersonajes()
    const personaje = personajes[Math.floor(Math.random() * personajes.length)]
    if (!personaje) return m.reply('《✤》 No se encontró ningún personaje disponible.')

    const reservado = Array.isArray(chat.personajesReservados)
      ? chat.personajesReservados.find((p) => p.name === personaje.name)
      : null

    const chatUsers = await getChatUser(chatId)
    const poseedor = chatUsers.find(user =>
      Array.isArray(user.characters) && user.characters.some((c) => c.name === personaje.name)
    )

    try {
      let estado = 'Libre'
      if (poseedor) {
        const userData = await getUser(poseedor.user_id)
        estado = `Reclamado por ${userData.name || 'Alguien'}`
      } else if (reservado) {
        const userData = await getUser(reservado.userId)
        estado = `Reservado por ${userData.name || 'Alguien'}`
      }

      await updateChatUser(chatId, userId, 'rwCooldown', now + 15 * 60000)

      const valorPersonaje =
        typeof personaje.value === 'number' ? personaje.value.toLocaleString() : '0'
      const mensaje = `➩ Nombre › *${personaje.name || 'Desconocido'}*

ੈ⚥‧₊˚ Género › *${personaje.gender || 'Desconocido'}*
ੈ⛁‧₊˚ Valor › *${valorPersonaje}*
ੈ❖‧₊˚ Estado › *${estado}*
ੈ❀︎‧₊˚ Fuente › *${personaje.source || 'Desconocido'}*

${dev}`

const imagen = await obtenerImagen(personaje.keyword, personaje.name);

if (!imagen) {
  return m.reply(`✎ No se pudo obtener una imagen para *${personaje.name}*.`);
}

const payload = {
  image: imagen,
  caption: mensaje,
  mimetype: 'image/jpeg'
};

const sent = await client.sendMessage(chatId, payload, { quoted: m });

      if (!poseedor) {
        const idUnico = uuidv4().slice(0, 8)
        const nuevoReservado = {
          id: idUnico,
          name: personaje.name,
          value: personaje.value || 0,
          gender: personaje.gender,
          source: personaje.source,
          keyword: personaje.keyword,
          userId: userId,
          reservedUntil: now + 20000,
          expiresAt: now + 60000,
          messageId: sent.key.id
        }
        
        let personajesReservados = chat.personajesReservados || []
        const indexExistente = personajesReservados.findIndex(
          p => p.name === personaje.name
        )
        
        if (indexExistente !== -1) {
          personajesReservados[indexExistente] = nuevoReservado
        } else {
          personajesReservados.push(nuevoReservado)
        }
        
        await updateChat(chatId, 'personajesReservados', personajesReservados)
      }
    } catch (e) {
      await updateChatUser(chatId, userId, 'rwCooldown', 0)
      return m.reply(msgglobal)
    }
  },
};
