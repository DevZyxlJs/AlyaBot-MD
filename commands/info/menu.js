import fetch from 'node-fetch';
import { getDevice } from '@whiskeysockets/baileys';
import fs from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';

const COMMANDS_URL = 'https://rest.alyabotpe.xyz/src/commands.js'

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async (client, m, args, command, text, prefix) => {
    try {
      const res = await fetch(COMMANDS_URL)
      const commandsText = await res.text()
      const commandsMatch = commandsText.match(/const commands = (\[[^]*?\]);/)
      if (!commandsMatch)
        throw new Error('No se pudo encontrar la variable `commands` en el archivo.')

      const commands = eval(commandsMatch[1])
      const now = new Date()
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
      const tiempo = colombianTime
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/,/g, '')
      const tiempo2 = moment.tz('America/Bogota').format('hh:mm A')

      const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
      const botSettings = global.db.data.settings[botId] || {}
      const botname = botSettings.namebot || ''
      const botname2 = botSettings.namebot2 || ''
      const banner = botSettings.banner || ''
      const owner = botSettings.owner || ''
      const link = botSettings.link || ''

      const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'
      const isPremiumBot = botSettings.botprem === true
      const isModBot = botSettings.botmod === true
      const botType = isOficialBot
        ? 'Owner'
            : 'Sub Bot'
      const users = Object.keys(global.db.data.users).length

     const time = client.uptime ? formatearMs(Date.now() - client.uptime) : "Desconocido"
      const device = getDevice(m.key.id);

      let menu = `> *¡ʜᴏʟᴀ!* ${global.db.data.users[m.sender].name}, como está tu día?, mucho gusto mi nombre es *${botname2}* ʚ♡⃛ɞ(ू•ᴗ•ू❁)*

   ⌒࣪᷼⏜͡  ۪  ࿚ꨪᰰ࿙  ࣭࣪⢏࣭۟⢢࣭ׄ᎐፝֟᎐࣭ׄ⡔࣭۟⡹࣭ׄ  ࿚ꨪᰰ࿙  ۪  ͡⏜ׄ᷼⌒

: ̗̀〄 *ᴅᴇᴠᴇʟᴏᴘᴇʀ ::* ${owner ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, '')) ? `${global.db.data.users[owner].name}` : owner) : "Oculto por privacidad"}
: ̗̀ꕥ *ᴛɪᴘᴏ ::* ${botType}
: ̗̀☄︎ *sɪsᴛᴇᴍᴀ/ᴏᴘʀ ::* ${device}

: ̗̀❖ *ᴛɪᴍᴇ ::* ${tiempo}, ${tiempo2}
: ̗̀❖ *ᴜsᴇʀs ::* ${users.toLocaleString()}
: ̗̀❖ *ᴍɪ ᴛɪᴇᴍᴘᴏ ::* ${time}
: ̗̀❖ *ᴜʀʟ ::* ${link}

  ⌒࣪᷼⏜͡  ۪  ࿚ꨪᰰ࿙  ࣭࣪⢏࣭۟⢢࣭ׄ᎐፝֟᎐࣭ׄ⡔࣭۟⡹࣭ׄ  ࿚ꨪᰰ࿙  ۪  ͡⏜ׄ᷼⌒


⋆｡ﾟ☁︎ ｡° *ᴄᴏᴍ꯭ᴀ꯭ɴᴅᴏs* ﾟ｡˚₊ 𓂃\n`

      const categoryArg = args[0]?.toLowerCase()
      const categories = {}

      for (const command of commands) {
        const category = command.category || 'otros'
        if (!categories[category]) categories[category] = []
        categories[category].push(command)
      }

      if (categoryArg && !categories[categoryArg]) {
        return m.reply(`《✤》 La categoría *${categoryArg}* no fue encontrada.`)
      }

      for (const [category, cmds] of Object.entries(categories)) {
        if (categoryArg && category.toLowerCase() !== categoryArg) continue
        const catName = category.charAt(0).toUpperCase() + category.slice(1)
         menu += `\n╭╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭࣭ׄ࣪ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╮\n│❀ *${catName} ☆(ﾉ◕ヮ◕)ﾉ*\n├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ╴ׂ╌ׅ╶╼.  ╾ׅ╴ׂ╌╶ׅ╌ׂ\n`;
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
          menu += `│✿ ${aliases} ${cmd.uso ? `+ ${cmd.uso}` : ''}\n`
          menu += `> ✺ ${cmd.desc}\n`
        })
          menu += `╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ \n`
      }

menu += `\n> *${botname2} desarrollado por Diego* ૮(˶ᵔᵕᵔ˶)ა`

let caption = menu

if (banner.endsWith('.mp4') || banner.endsWith('.gif') || banner.endsWith('.webm')) {
          await client.sendMessage(m.chat, { video: { url: banner }, caption }, { quoted: m })

} else {
    await client.sendMessage(m.chat, {
      text: menu,
      contextInfo: {
        mentionedJid: [...menu.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net'),
        externalAdReply: {
          renderLargerThumbnail: true,
          title: botname,
          body: `${botname2}, Built With 💛 By Stellar`,
          mediaType: 1,
          thumbnailUrl: banner,
         // thumbnail: banner,
         // sourceUrl: redes
        }
      }
    }, { quoted: m })

}
    } catch (e) {
      await m.reply(msgglobal)
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