import fetch from 'node-fetch';
import { getDevice } from '@whiskeysockets/baileys';
import fs from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async (client, m, args) => {
    try {
      const now = new Date();
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
      const tiempo = colombianTime.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/,/g, '');
      const tiempo2 = moment.tz('America/Bogota').format('hh:mm A');

      const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net' || '';
      const botSettings = global.db.data.settings[botId] || {};
      const botname = botSettings.namebot || '';
      const botname2 = botSettings.namebot2 || '';
      const banner = botSettings.banner || '';
      const owner = botSettings.owner || '';
      const canalId = botSettings.id || '120363420992828502@newsletter';
      const canalName = botSettings.nameid || '𐚁๋࣭⭑ֶָ֢ ѕтєℓℓαя ωα ⚡︎ ¢нαηηєℓ ₍ᐢ..ᐢ₎♡';
      const link = botSettings.link || bot.api;

      const prefix = botSettings.prefijo

      const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net';
      const isPremiumBot = botSettings.botprem === true;
      const isModBot = botSettings.botmod === true;
      const botType = isOficialBot
        ? 'Principal/Owner'
        : isPremiumBot
          ? 'Premium'
          : isModBot
            ? 'Principal/Mod'
            : 'Sub Bot';
      const users = Object.keys(global.db.data.users).length;
      const device = getDevice(m.key.id);
      const sender = global.db.data.users[m.sender].name;

const time = client.uptime ? formatearMs(Date.now() - client.uptime) : "Desconocido"

      let menu = `🌱 Pronto...`.trim();

      const replacements = {
        $owner: owner ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, '')) ? `@${owner.split('@')[0]}` : owner) : 'Oculto por privacidad',
        $botType: botType,
        $device: device,
        $tiempo: tiempo,
        $tiempo2: tiempo2,
        $users: users.toLocaleString() || '0',
        $link: link,
        $sender: sender,
        $botname2: botname2,
        $botname: botname2,
        $namebot: botname2,
        $prefix: prefix,
        $uptime: time
      };

      for (const [key, value] of Object.entries(replacements)) {
        menu = menu.replace(new RegExp(`\\${key}`, 'g'), value);
      }

      if (banner.endsWith('.mp4') || banner.endsWith('.gif') || banner.endsWith('.webm')) {
        await client.sendMessage(
          m.chat,
          {
            video: { url: banner },
            gifPlayback: true,
            caption: menu,
            contextInfo: {
              mentionedJid: [owner, m.sender],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: canalId,
                serverMessageId: '0',
                newsletterName: canalName
              }
            }
          },
          { quoted: m }
        );
      } else {
        await client.sendMessage(
          m.chat,
          {
            text: menu,
            contextInfo: {
              mentionedJid: [owner, m.sender],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: canalId,
                serverMessageId: '0',
                newsletterName: canalName
              },
              externalAdReply: {
                title: botname,
                body: `${botname2}, Built With 💛 By Stellar`,
                showAdAttribution: false,
                thumbnailUrl: banner,
                mediaType: 1,
                previewType: 0,
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: m }
        );
      }
    } catch (e) {
      await m.reply(msgglobal);
    }
  }
};

function formatearMs(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  return [dias && `${dias}d`, `${horas % 24}h`, `${minutos % 60}m`, `${segundos % 60}s`].filter(Boolean).join(" ");
}
