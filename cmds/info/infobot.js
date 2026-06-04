import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import { prepareWAMessageMedia } from 'baileys';
import os from 'os';

function rTime(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const msg = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const dDisplay = d > 0 ? d + (d === 1 ? " día, " : " días, ") : ""
  const hDisplay = h > 0 ? h + (h === 1 ? " hora, " : " horas, ") : ""
  const mDisplay = msg > 0 ? msg + (msg === 1 ? " minuto, " : " minutos, ") : ""
  const sDisplay = s > 0 ? s + (s === 1 ? " segundo" : " segundos") : ""
  return dDisplay + hDisplay + mDisplay + sDisplay
}

export default {
  command: ['infobot', 'infosocket', 'info'],
  category: 'info',
  run: async ({ msg, sock }) => {
    const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net"
    const botSettings = await getSettings(botId)

    const botname = botSettings.namebot || 'Ai Surus'
    const botname2 = botSettings.namebot2 || 'Surus'
    const monedas = botSettings.currency || 'BitCoins'
    const banner = botSettings.banner
    const prefijo = botSettings.prefijo
    const owner = botSettings.owner
    const canalId = botSettings.id
    const canalName = botSettings.nameid
    const link = botSettings.link
    const comando = botSettings.commandsejecut

    let desar = 'Oculto'
    if (owner && !isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))) {
      const userData = await getUser(owner)
      desar = userData?.genre || 'Oculto'
    }

    const platform = os.type()
    const now = new Date()
    const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
    const nodeVersion = process.version
    const sistemaUptime = rTime(os.uptime())

    const uptime = process.uptime()
    const uptimeDate = new Date(colombianTime.getTime() - uptime * 1000)
    const formattedUptimeDate = uptimeDate.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/^./, msg => msg.toUpperCase())

      const isOficialBot = botId === global.sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const botType = isOficialBot
        ? 'Owner'
            : 'Sub Bot'

    try {
    const message = `> ꕤ  ˖⁩   ౼ Información :: *${botname2}*

ׅ  ׄ  ✤   ׅ り Nombre Largo :: *${botname}*
ׅ  ׄ  ✤   ׅ り Nombre Corto :: *${botname2}*
ׅ  ׄ  ✤   ׅ り 𝖬𝗈𝗇𝖾𝖽𝖺 :: *${monedas}*   
ׅ  ׄ  ✤   ׅ り 𝖯𝗋𝖾𝖿𝗂𝗃𝗈s :: *${prefijo}*
ׅ  ׄ  ✤   ׅ り 𝖢𝗆𝖽 𝖤𝗃𝖾𝖼 :: *${comando.toLocaleString()}*

𖹭᳔ㅤㅤㅤׄㅤㅤ❏ㅤㅤׅㅤㅤゕㅤㅤׄㅤㅤㅤ𑄾𑄾

ׅ  ׄ  ✿   ׅ り Tipo :: *${botType}*
ׅ  ׄ  ✿   ׅ り Developer :: ${owner ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, '')) ? `@${owner.split('@')[0]}` : owner) : "Oculto por privacidad"}
ׅ  ׄ  ✿   ׅ り Activo Desde :: *${formattedUptimeDate}*
ׅ  ׄ  ✿   ׅ り Plataforma :: *${platform}*
ׅ  ׄ  ✿   ׅ り NodeJS :: *${nodeVersion}*

𖹭᳔ㅤㅤㅤׄㅤㅤ❀ㅤㅤׅㅤㅤゕㅤㅤׄㅤㅤㅤ𑄾𑄾

> \`Enlace:\` ${link}`.trim()

      const menu = message
      const isVideo = banner.includes('.mp4') || banner.includes('.gif') || banner.includes('.webm');
      const contextBase = {
        mentionedJid: [owner, msg.sender].filter(Boolean),
        isForwarded: false
      };

      if (isVideo) {
        await sock.sendMessage(
          msg.chat,
          { video: { url: banner }, caption: menu.trim(), contextInfo: contextBase },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(msg.chat, { 
          text: menu.trim(), 
          linkPreview: link && banner ? (await prepareWAMessageMedia({ image: { url: banner } }, { upload: sock.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }).then(({ imageMessage }) => ({ 'canonical-url': link, 'matched-text': link, title: botname, description: `${botname2}, Built With 💛 By Stellar`, jpegThumbnail: imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined, highQualityThumbnail: imageMessage || undefined }))) : undefined, 
          contextInfo: contextBase
        }, { quoted: msg });
      }

   } catch (e) {
     msg.reply(msgglobal)
   }
  }
};