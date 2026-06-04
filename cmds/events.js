import { normalizeJid, resolveParticipantJid, resolveJidSync, deleteCachedMeta, getCachedMeta, setCachedMeta } from '#serialize';
import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database";
import chalk from 'chalk';
import moment from 'moment-timezone';
import { prepareWAMessageMedia } from 'baileys';

function getGroupAdmins(participants) {
  return (participants ?? []).filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id).filter(Boolean);
}

function resolveEventParticipant(p, sock) {
  if (typeof p === 'string') return resolveJidSync(p, sock) || p;
  return resolveParticipantJid(p, sock) || normalizeJid(p.id || p.phoneNumber || p.jid || p.lid || '') || '';
}

export default async (sock, msg) => {
  sock.ev.on('group-participants.update', async (anu) => {
    try {
      if (['add', 'remove', 'leave', 'promote', 'demote'].includes(anu.action)) {
        deleteCachedMeta(anu.id);
      }

      const metadata = await (async () => {
        const cached = getCachedMeta(anu.id);
        if (cached) return cached;
        for (let i = 0; i < 3; i++) {
          const m = await sock.groupMetadata(anu.id).catch(() => null);
          if (m) { setCachedMeta(anu.id, m); return m; }
          await new Promise(r => setTimeout(r, 1500));
        }
        return null;
      })();

      const groupAdmins = metadata ? getGroupAdmins(metadata.participants) : [];
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      
      const chat = await getChat(anu.id);
      const botSettings = await getSettings(botId);
      
      const primaryBotId = chat?.primaryBot;
      const isSelf = (botSettings?.self ?? 0) || (chat?.isMute ?? false);
      
      if (isSelf) return;

      const now = new Date();
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
      const tiempo = colombianTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/,/g, '');
      const tiempo2 = moment.tz('America/Bogota').format('hh:mm A');
      const memberCount = metadata?.participants?.length || 0;

      for (const p of anu.participants) {
        const jid = resolveEventParticipant(p, sock);
        if (!jid) continue;
        
        const phone = jid.split('@')[0];
        const userData = await getUser(jid);
        const name = userData?.name || phone;
        
        const avatar = await sock.profilePictureUrl(jid, 'image').catch(() => "https://cloud.stellarwa.xyz/i6AeOyYU.jpeg");

        const contextBase = {
          mentionedJid: [jid].filter(Boolean),
          isForwarded: false
        };

        if (anu.action === 'add' && chat?.welcome && (!primaryBotId || primaryBotId === botId)) {
          if (!metadata) continue;
          
          let caption;
          if (chat.welcomeMessage && chat.welcomeMessage.trim() !== '') {
            caption = chat.welcomeMessage
              .replace(/@user/g, `@${phone}`)
              .replace(/@group/g, metadata.subject || '')
              .replace(/@desc/g, metadata.desc || 'Sin descripción')
              .replace(/@members/g, memberCount)
              .replace(/@time/g, `${tiempo} ${tiempo2}`);
          } else {
            caption = `ത        ׂ𖹭     ׅ    ꒰͡     𝖭 ⋃ Σ 𝖵 𝖮     
𑄹𑄹  »   𝙐 𝙎 𝙀 𝙍!!*    ✬✫

⪩⪩   ֹ  \`𝖡𝗂𝖾ɳ𝗏𝖾𝗇𝗂𝖽@ 𝖺\`
                 \`${metadata.subject || ''}\`  ꒱꒱ㅤㅤㅤ

*ֹ  ᦕ   ׄ                      _@${phone}_*

         ׅ     ⑅ ׄ     .˙ Disfruta tu estadía!ֹ

な⃟   ۟  ─ _Ahora somos *${memberCount}* miembros!_

> Puedes usar \`/help\` para ver la lista de comandos.
> ✐ 𝐋𝐢𝐧𝐤 » ${botSettings.link || ''}`;
          }

          const linkPreview = botSettings.link && avatar ? (
            await prepareWAMessageMedia(
              { image: { url: avatar } },
              { upload: sock.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
            ).then(({ imageMessage }) => ({
              'canonical-url': botSettings.link,
              'matched-text': botSettings.link,
              title: "˚₊·—̳͟͞͞♡ 𝐖 𝐄 𝐋 𝐂 𝐎 𝐌 𝐄 ₍ᐢ..ᐢ₎♡",
              description: `${botSettings.namebot2 || 'Stellar Bot'}, Built With 💛 By Stellar`,
              jpegThumbnail: imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined,
              highQualityThumbnail: imageMessage || undefined
            }))
          ) : undefined;

          await sock.sendMessage(anu.id, { 
            text: caption.trim(), 
            linkPreview: linkPreview, 
            contextInfo: contextBase
          }, { quoted: null });
        }

        if ((anu.action === 'remove' || anu.action === 'leave') && chat?.goodbye && (!primaryBotId || primaryBotId === botId)) {
          if (!metadata) continue;

          let caption;
          if (chat.byeMessage && chat.byeMessage.trim() !== '') {
            caption = chat.byeMessage
              .replace(/@user/g, `@${phone}`)
              .replace(/@group/g, metadata.subject || '')
              .replace(/@desc/g, metadata.desc || 'Sin descripción')
              .replace(/@members/g, memberCount)
              .replace(/@time/g, `${tiempo} ${tiempo2}`);
          } else {
            caption = `ത        ׂ𖹭     ׅ    ꒰͡     A ᗞＩO S     
𑄹𑄹  »   𝙐 𝙎 𝙀 𝙍!!*    ✬✫

⪩⪩   ֹ  \`𝙷𝚊𝚜𝚝𝚊 𝚕𝚞𝚎𝚐𝚘 𝚍𝚎\`
                 \`${metadata.subject || ''}\`  ꒱꒱ㅤㅤㅤ

*ֹ  ᦕ   ׄ                      _@${phone}_*

         ׅ     ⑅ ׄ     .˙ Espero vuelvas Pronto!ֹ

な⃟   ۟  ─ _Ahora somos *${memberCount}* miembros!_

> Puedes usar \`/help\` para ver la lista de comandos.
> ✐ 𝐋𝐢𝐧𝐤 » ${botSettings.link || ''}`;
          }

          const linkPreview = botSettings.link && avatar ? (
            await prepareWAMessageMedia(
              { image: { url: avatar } },
              { upload: sock.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
            ).then(({ imageMessage }) => ({
              'canonical-url': botSettings.link,
              'matched-text': botSettings.link,
              title: "˚₊·—̳͟͞͞♡ 𝐁 𝐘 𝐄 ₍ᐢ..ᐢ₎♡",
              description: `${botSettings.namebot2 || 'Stellar Bot'}, Built With 💛 By Stellar`,
              jpegThumbnail: imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined,
              highQualityThumbnail: imageMessage || undefined
            }))
          ) : undefined;

          await sock.sendMessage(anu.id, { 
            text: caption.trim(), 
            linkPreview: linkPreview, 
            contextInfo: contextBase
          }, { quoted: null });
        }

        if (anu.action === 'remove' || anu.action === 'leave') {
          const user = chat?.users?.[jid];
          if (user && typeof user.afk === 'number' && user.afk > -1) {
             if(chat && chat.users && chat.users[jid]) {
                chat.users[jid].afk = -1;
                chat.users[jid].afkReason = '';
             }
          }
        }

        if (anu.action === 'promote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const authorJid = normalizeJid(anu.author) || anu.author;
          await sock.sendMessage(anu.id, { 
            text: `「✎」 *@${phone}* ha sido promovido a Administrador por *@${authorJid.split('@')[0]}.*`, 
            mentions: [jid, authorJid, ...groupAdmins] 
          });
        }

        if (anu.action === 'demote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const authorJid = normalizeJid(anu.author) || anu.author;
          await sock.sendMessage(anu.id, { 
            text: `「✎」 *@${phone}* ha sido degradado de Administrador por *@${authorJid.split('@')[0]}.*`, 
            mentions: [jid, authorJid, ...groupAdmins] 
          });
        }
      }
    } catch (err) {
      console.log(chalk.gray(`[ EVENT ERROR ] → ${err}`));
    }
  });
};
