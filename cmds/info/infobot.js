import db from "#db";
import os from 'os';
import { linksPreview } from '#serialize';

function rTime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const msg = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d === 1 ? " día, " : " días, ") : "";
  const hDisplay = h > 0 ? h + (h === 1 ? " hora, " : " horas, ") : "";
  const mDisplay = msg > 0 ? msg + (msg === 1 ? " minuto, " : " minutos, ") : "";
  const sDisplay = s > 0 ? s + (s === 1 ? " segundo" : " segundos") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function getMemoryStats({
  rssBytes = process.memoryUsage().rss,
  systemTotalBytes = os.totalmem(),
  constrainedBytes = process.constrainedMemory?.() || 0
} = {}) {
  const constrained = Number.isFinite(constrainedBytes) && constrainedBytes > 0 && constrainedBytes < systemTotalBytes;
  const limitBytes = constrained ? constrainedBytes : systemTotalBytes;
  return {
    usedBytes: rssBytes,
    limitBytes,
    percent: limitBytes > 0 ? rssBytes / limitBytes * 100 : 0,
    limitKind: constrained ? 'contenedor' : 'sistema'
  };
}

function formatMemory(bytes, {binary = true} = {}) {
  if (bytes === 0) return '0 B';

  const base = binary ? 1024 : 1000;
  const units = binary 
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB'] 
    : ['B', 'KB', 'MB', 'GB', 'TB'];

  const exponent = Math.floor(Math.log(bytes) / Math.log(base));
  const value = bytes / Math.pow(base, exponent);

  return `${value.toFixed(2)} ${units[exponent]}`;
}

export default {
  command: ['infobot', 'infosocket', 'info'],
  category: 'info',
  run: async ({ msg, sock }) => {
    const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net";
    const botSettings = await db.getSettings(botId);

    const botname = botSettings.namebot || 'Ai Surus';
    const botname2 = botSettings.namebot2 || 'Surus';
    const monedas = botSettings.currency || 'BitCoins';
    const banner = botSettings.banner;
    const owner = botSettings.owner;
    const link = botSettings.link;
    const comando = botSettings.commandsejecut;
    const prefijo = (botSettings.prefijo === 1 || botSettings.prefijo === true) ? 'noprefix' : botSettings.prefijo;

    const platform = os.type();
    const now = new Date();
    const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const nodeVersion = process.version;

    const uptime = process.uptime();
    const uptimeDate = new Date(colombianTime.getTime() - uptime * 1000);
    const formattedUptimeDate = uptimeDate.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/^./, msg => msg.toUpperCase());
    const memory = getMemoryStats();
    const ram = `${formatMemory(memory.usedBytes)} / ${formatMemory(memory.limitBytes)} (${memory.percent.toFixed(2)}%)`;

    const oficialId = global?.sock ? global?.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' : '';
    const isOficialBot = botId === oficialId;

    const botType = isOficialBot
      ? 'Owner'
          : 'Sub Bot';

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
ׅ  ׄ  ✿   ׅ り Ram Utilizada :: *${ram}*
ׅ  ׄ  ✿   ׅ り Plataforma :: *${platform}*
ׅ  ׄ  ✿   ׅ り NodeJS :: *${nodeVersion}*

𖹭᳔ㅤㅤㅤׄㅤㅤ❀ㅤㅤׅㅤㅤゕㅤㅤׄㅤㅤㅤ𑄾𑄾

> \`Enlace:\` ${link}`.trim();

      const isVideo = banner.includes('.mp4') || banner.includes('.gif') || banner.includes('.webm');
      const contextBase = {
        mentionedJid: [owner, msg.sender].filter(Boolean),
        isForwarded: false
      };

      if (isVideo) {
        return sock.sendMessage(
          msg.chat,
          { video: { url: banner }, caption: message, contextInfo: contextBase },
          { quoted: msg }
        );
      }

      const preview = link && banner
        ? await linksPreview(sock, banner).then((imageMessage) => ({
            'canonical-url': link,
            'matched-text': link,
            title: botname,
            description: `${botname2}, Built With 🤍 By Stellar`,
            jpegThumbnail: imageMessage?.jpegThumbnail
              ? Buffer.from(imageMessage.jpegThumbnail)
              : undefined,
            highQualityThumbnail: imageMessage || undefined
          }))
        : undefined;

      return sock.sendMessage(
        msg.chat,
        { text: message, linkPreview: preview, contextInfo: contextBase },
        { quoted: msg }
      );

    } catch (e) {
      msg.reply(msgglobal);
    }
  }
};