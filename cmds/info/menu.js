import db from "#db"
import { getDevice, prepareWAMessageMedia } from 'baileys';
import fs from 'fs';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';
import { commands } from '../../lib/system/comandos.js';

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {

      const now = new Date();
      const colombianTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/Bogota' })
      );
      const tiempo = colombianTime
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/,/g, '');
      const tiempo2 = moment.tz('America/Bogota').format('hh:mm A');

      const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net' || '';
      const botSettings = await db.getSettings(botId);
      const botname = botSettings.namebot || '';
      const botname2 = botSettings.namebot2 || '';
      const banner = botSettings.banner || '';
      const owner = botSettings.owner || '';
      const link = botSettings.link || '';

const oficialId = global?.sock ? global?.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' : ''
const isOficialBot = botId === oficialId

const isPremiumBot = botSettings.botprem === 1
const isModBot = botSettings.botmod === 1

const botType = isOficialBot
  ? 'Owner'
      : 'Sub Bot'

      const userr = await db.getUser();
      const users = Object.keys(userr).length || 0;

      const time = sock.uptime
        ? formatearMs(Date.now() - sock.uptime)
        : 'Desconocido';
      const device = getDevice(msg.key.id);

      const own = await db.getUser(owner);

      let menu = `──ㅤׅ   ˙ ੭    _¡𝑯𝐨𝐥𝐚! *@${msg.pushName}*, 𝐜ó𝐦𝐨 𝐯𝐚𝐬?, 𝐞𝐧𝐜𝐚𝐧𝐭𝐚𝐝𝐚 𝐦𝐢 𝐧𝐨𝐦𝐛𝐫𝐞 𝐞𝐬 *${botname2}*_

‿    ׅ   𝆬     ε❤︎︭з   𝆬     ׅ      ‿

: ̗̀〄 *ᴅᴇᴠᴇʟᴏᴘᴇʀ ::* ${
        owner
          ? !isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))
            ? `${own.name}`
            : owner
          : 'Oculto por privacidad'
      }
: ̗̀ꕥ *ᴛɪᴘᴏ ::* ${botType}
: ̗̀☄︎ *sɪsᴛᴇᴍᴀ/ᴏᴘʀ ::* ${device}

: ̗̀❖ *ᴛɪᴍᴇ ::* ${tiempo}, ${tiempo2}
: ̗̀❖ *ᴜsᴇʀs ::* ${users.toLocaleString()}
: ̗̀❖ *ᴍɪ ᴛɪᴇᴍᴘᴏ ::* ${time}
: ̗̀❖ *ᴜʀʟ ::* ${link}

‿    ׅ   𝆬     ε❤︎︭з   𝆬     ׅ      ‿
${String.fromCharCode(8206).repeat(4000)}\n
⋆｡ﾟ☁︎ ｡° *ᴄᴏᴍ꯭ᴀ꯭ɴᴅᴏs* ﾟ｡˚₊ 𓂃\n`;

      const categoryArg = args[0]?.toLowerCase();
      const categories = {};

      for (const command of commands) {
        const category = command.category || 'otros';
        if (!categories[category]) categories[category] = [];
        categories[category].push(command);
      }

      const categoryEmojisList = [
        '☁️', '🖌️', '🛍️', '🪃', '☕', '🪼', '🫘', '🪷', '🍂', '🌾', '🧈', '🪡', '🍚'
      ];

      let emojiIndex = 0;

      if (categoryArg && !categories[categoryArg]) {
        return msg.reply(
          `《✤》 La categoría *${categoryArg}* no fue encontrada.`
        );
      }

      for (const [category, cmds] of Object.entries(categories)) {
        if (categoryArg && category.toLowerCase() !== categoryArg) continue;
        const catName = category.charAt(0).toUpperCase() + category.slice(1);

        const catEmoji = categoryEmojisList[emojiIndex % categoryEmojisList.length];
        emojiIndex++;
        menu += `\n☕︎  𝀢  塞缪尔ᅟ֪   ﹙ *\`${catName}\`* ﹚ᅟ ㅤ✿\n\n`;
        cmds.forEach((cmd) => {
          const cleanPrefix = prefix
          const aliases = cmd.alias
            .map((a) => {
              const aliasClean = a
                .split(/[\/#!+.\-]+/)
                .pop()
                .toLowerCase()
              return `${prefix}${aliasClean}`
            })
            .join(' › ')
          menu += `❀   ᠀᠀ㅤ۟ ${catEmoji}  ${aliases} ${cmd.uso ? `+ ${cmd.uso}` : ''}\n`
          menu += `> ── 𑁪ㅤׅㅤ۫  ${cmd.desc}\n`
        })
        menu += `\n ㅤׅㅤ۫ㅤㅤ      ﹙❀﹚ㅤׅㅤㅤ˚ㅤ\n`
      }

      menu += `\n> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ`;

      const isVideo = banner.includes('.mp4') || banner.includes('.gif') || banner.includes('.webm');
      const contextBase = {
        mentionedJid: null,
        isForwarded: false
      };

      if (isVideo) {
        await sock.sendMessage(
          msg.chat,
          { video: { url: banner }, caption: menu, contextInfo: contextBase },
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
      await msg.reply(msgglobal);
    }
  },
};

function formatearMs(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  return [dias && `${dias}d`, `${horas % 24}h`, `${minutos % 60}m`, `${segundos % 60}s`]
    .filter(Boolean)
    .join(' ');
}