import moment from 'moment-timezone';
import { resolveLidToRealJid } from "../../core/utils.ts"

export default {
  command: ['profile', 'perfil'],
  category: 'profile',
  run: async (client, m) => {
    const texto = m.mentionedJid
    const who2 = texto.length > 0 ? texto[0] : m.quoted ? m.quoted.sender : m.sender
    const userId = await resolveLidToRealJid(who2, client, m.chat);

    const chat = await getChat(m.chat)
    const chatUsers = await getChatUser(m.chat, userId)
    const globalUsers = await getUser(userId)
   const userss = await getChatUser(m.chat, userId)

    if (!userss) {
      return m.reply('✐ El usuario *mencionado* no está *registrado* en el bot')
    }

    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net' || ''
    const settings = await getSettings(idBot)
    const currency = settings.currency || ''

    const user = chatUsers || {}
    const user2 = globalUsers || {}

    const globalUsers2 = await getUser(user2.marry)
    const globalUsers3 = await getUser()

    const name = user2.name || ''
    const birth = user2.birth || 'Sin especificar'
    const genero = user2.genre || 'Oculto'
    const comandos = user2.usedcommands || '0'
    const pareja = user2.marry ? `${globalUsers2.name}` : 'Nadie'
    const estadoCivil =
      genero === 'Mujer' ? 'Casada con' : genero === 'Hombre' ? 'Casado con' : 'Casadx con'
    const desc = user2.description ? `\n\n${user2.description}` : ''
    const pasatiempo = user2.pasatiempo ? `${user2.pasatiempo}` : 'No definido'
    const exp = user2.exp || 0
    const nivel = user2.level || 0
    const chocolates = user.coins || 0
    const banco = user.bank || 0
    const totalCoins = chocolates + banco
    const harem = user?.characters?.length || 0

    const perfil = await client
      .profilePictureUrl(userId, 'image')
      .catch((_) => 'https://cdn.sockywa.xyz/files/1751246122292.jpg')

const users = (globalUsers3 || []).map(u => ({...u, jid: u.id }))
const sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0))
try {
  const rank = sortedLevel.findIndex(u => u.jid === userId) + 1

    const profileText = `- ׄ　ꕤ　ׅ ໌　۟　𝖯𝖾𝗋𝖿𝗂𝗅　ׅ　팅화　ׄ

𖣣ֶㅤ֯⌗ ❖ ׄ ⬭ Cumpleaños › *${birth}*
𖣣ֶㅤ֯⌗ ❀ ׄ ⬭ Pasatiempo › *${pasatiempo}*
𖣣ֶㅤ֯⌗ ⚥ ׄ ⬭ Género › *${genero}*
𖣣ֶㅤ֯⌗ ✿ ׄ ⬭ ${estadoCivil} › *${pareja}*${desc}

𖣣ֶㅤ֯⌗ ✧ ׄ ⬭ Nivel › *${nivel}*
𖣣ֶㅤ֯⌗ ✤ ׄ ⬭ Experiencia › *${exp.toLocaleString()}*
𖣣ֶㅤ֯⌗ ❒ ׄ ⬭ Puesto › *#${rank}*

𖣣ֶㅤ֯⌗ ꕥ ׄ ⬭ Harem › *${harem.toLocaleString()}*
𖣣ֶㅤ֯⌗ ⛁  ׄ ⬭ Dinero Total › *¥${totalCoins.toLocaleString()} ${currency}*
𖣣ֶㅤ֯⌗ ☄︎  ׄ ⬭ Comandos ejecutados › *${comandos.toLocaleString()}*`

   await client.sendMessage(
      m.chat,
      {
        image: { url: perfil },
        caption: profileText,
      },
      { quoted: m },
    )
  } catch (e) {
  m.reply(msgglobal)
  }
  }
};