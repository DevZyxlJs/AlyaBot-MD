import db from "#db";
import { commands } from '../../lib/system/comandos.js';
import { linksPreview } from '#serialize';

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async ({ msg, sock, args, usedPrefix: prefix }) => {
    try {
      const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net' || '';
      const botSettings = await db.getSettings(botId);
      const botname = botSettings.namebot || '';
      const botname2 = botSettings.namebot2 || '';
      const banner = botSettings.banner || '';
      const owner = botSettings.owner || '';
      const links = botSettings.link || '';
      const link = `https://web.stellarwa.xyz/home`

      const oficialId = global?.sock
        ? global.sock.user.id.split(':')[0] + '@s.whatsapp.net'
        : '';
      const isOficialBot = botId === oficialId;
      const botType = isOficialBot
        ? '𝐎𝐰𝐧𝐞𝐫'
            : '𝐒𝐮𝐛-𝐁𝐨𝐭';

      const own = await db.getUser(owner);

      let menu = `‎   ── ˙ ¡𝐇ola!, soy ${botname2} (*${botType}*) .
✎ ᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ʟᴏs ᴄᴏᴍᴀɴᴅᴏs

︵𝆣᷼ ͡︵᷼𝆣 ᷼͡︵᷼𝆣 ᷼͡︵ ᅟິᅟᅟ︵𝆣᷼ ͡︵᷼𝆣 ᷼͡︵᷼𝆣 ᷼͡︵

- 𐫦ϟ │ 𝐄nlace ❚❙    ❀  
⸺　${links}
- 𐫦ϟ │ 𝐃eveloper  ❚❙    ✿  
⸺　${
        owner
          ? !isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))
            ? `${own.name}`
            : owner
          : 'Oculto por privacidad'
      }

ᅟᅟ︶͜︶͜︶ᅟᅟ֪ᅟ֪ᅟᅟ︶͜︶͜︶

> ૮(˶ᵔᕕᔔ˶)ა Conéctate como *SubBot* en nuestra web oficial:
> ✐ ${link}

${String.fromCharCode(8206).repeat(4000)}`;

      const categoryArg = args[0]?.toLowerCase();
      const categories = {};

      for (const command of commands) {
        const category = command.category || 'otros';
        if (!categories[category]) categories[category] = [];
        categories[category].push(command);
      }

      const categoryEmojisList = [
        "˚୨•(=^●ω●^=)•", "☆(ゝω·)>", "ღゝ◡╹ )ノ", "ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ", "(•ૢ⚈͒⌄⚈͒•ૢ)", "ฅ^·ﻌ·^ฅ", "≽^• ˕ • ྀི≼", "(𓂂꜆◕⩊◕꜀𓂂)", "ʚ(꒪ˊ꒳ˋ꒪)ɞ", "ෆ(՞ ⌯'ᵕ'⌯ ՞)ෆ ̖́-", "(ᯫ᳐˶ꔷ֊ꔷᯫ᳐)ฅ", "(✿◡‿◡)", "ᜊ(꒪ˊ꒳ˋ꒪)ᜊ"
      ];

      const categoryNameList = [
        '𝐀𝗇𝗂𝗆𝖾', '𝐃ownload', '𝐄conomia', '𝐆acha', '𝐆rupo', '𝐈a', '𝐈nfo', '𝐍sfw', '𝐏rofile', '𝐒earch', '𝐒ocket', '𝐒ticker', '𝐔tils'
      ];

      const categoryNameMap = {
        'anime': '𝐀𝗇𝗂𝗆𝖾',
        'download': '𝐃ownload',
        'economia': '𝐄conomia',
        'gacha': '𝐆acha',
        'grupo': '𝐆rupo',
        'ia': '𝐈a',
        'info': '𝐈nfo',
        'nsfw': '𝐍sfw',
        'profile': '𝐏rofile',
        'search': '𝐒earch',
        'sockets': '𝐒ocket',
        'stickers': '𝐒ticker',
        'utils': '𝐔tils'
      };

      const categoryDescriptions = {
        'anime': 'Comandos de reacciones de anime.',
        'download': 'Comandos de Descargas para descargar archivos de varias fuentes.',
        'economia': 'Comandos de Economía para ganar dinero y divertirte con tus amigos.',
        'gacha': 'Comandos de Gacha para reclamar y intercambiar personajes.',
        'grupo': 'Comandos para administradores de grupos.',
        'ia': 'Comandos de Inteligencia Artificial.',
        'info': 'Comandos de información general del bot.',
        'nsfw': 'Comandos NSFW (contenido para adultos).',
        'profile': 'Comandos de Perfil para ver y configurar tu perfil.',
        'search': 'Comandos de búsqueda en diferentes plataformas.',
        'sockets': 'Comandos para registrar tu propio bot.',
        'stickers': 'Comandos de *Stickers* para crear y gestionar stickers.',
        'utils': 'Comandos de Utilidades para el día a día del bot.'
      };

      const availableCategories = Object.keys(categories).map(c => c.toLowerCase());

      if (categoryArg && !availableCategories.includes(categoryArg)) {
        return msg.reply(
          `《✤》 La categoría *${categoryArg}* no fue encontrada.\n\n> Categorías disponibles:\n${availableCategories.map(c => `› ${prefix}${c}`).join('\n')}`
        );
      }

      let emojiIndex = 0;

      for (const [category, cmds] of Object.entries(categories)) {
        if (categoryArg && category.toLowerCase() !== categoryArg) continue;

        const catName = categoryNameMap[category.toLowerCase()] 
          || category.charAt(0).toUpperCase() + category.slice(1);
        const catEmoji = categoryEmojisList[emojiIndex % categoryEmojisList.length];
        emojiIndex++;
        const description = categoryDescriptions[category.toLowerCase()] 
          || `Comandos de ${catName}.`;

        menu += `\n- ꪆ  ❬ ${catEmoji} ❭  *\`${catName}\`*  ᰨᰍ    *;*\n`;
        menu += `> ✐ ${description}\n\n`;

        cmds.forEach((cmd) => {
          const aliases = (cmd.alias || [])
            .map((a) => {
              const aliasClean = a.split(/[\/#!+.\-]+/).pop().toLowerCase();
              return `${prefix}${aliasClean}`;
            })
            .join(' › ');
          menu += `❀   ᠀᠀ㅤ۟  ${aliases} ${cmd.uso ? `+ ${cmd.uso}` : ''}\n`;
          menu += `> ── 𑁪ㅤׅㅤ۫ _${cmd.desc}_\n`;
        });

        menu += `\n ㅤׅㅤ۫ㅤㅤ      ﹙❀﹚ㅤׅㅤㅤ˚ㅤ\n`;
      }

      const isVideo =
        banner.includes('.mp4') ||
        banner.includes('.gif') ||
        banner.includes('.webm');

      const contextBase = {
        mentionedJid: null,
        isForwarded: false,
        /*forwardedNewsletterMessageInfo: {
          newsletterJid: "",
          serverMessageId: 0,
          newsletterName: "Canal Oficial",
        },*/
      };

      if (isVideo) {
        return sock.sendMessage(
          msg.chat,
          {
            video: { url: banner },
            caption: menu.trim(),
            contextInfo: contextBase,
          },
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
            highQualityThumbnail: imageMessage || undefined,
          }))
        : undefined;

      return sock.sendMessage(
        msg.chat,
        { text: menu, linkPreview: preview, contextInfo: contextBase },
        { quoted: msg }
      );
    } catch (e) {
      await msg.reply(msgglobal);
    }
  },
};