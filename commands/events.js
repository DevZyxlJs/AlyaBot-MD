import chalk from 'chalk'
import moment from 'moment-timezone'

export default async (client, m) => {
  client.ev.on('group-participants.update', async (anu) => {
    try {
      const metadata = await client.groupMetadata(anu.id)
      const chat = global.db.data.chats[anu.id]
      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
      const primaryBotId = chat?.primaryBot

      const isSelf = global.db.data.settings[botId]?.self ?? false
      if (isSelf) return

      const now = new Date()
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
      const tiempo = colombianTime.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/,/g, '')
      const tiempo2 = moment.tz('America/Bogota').format('hh:mm A')

      const memberCount = metadata.participants.length

      for (const p of anu.participants) {
        const jid = p.phoneNumber
        const phone = p.phoneNumber?.split('@')[0] || jid.split('@')[0]
        const pp = await client.profilePictureUrl(jid, 'image').catch(_ => 'https://cdn.sockywa.xyz/files/1755559736781.jpeg')

        const fakeContext = {
          contextInfo: {        
            externalAdReply: {
              title: global.db.data.settings[botId].namebot,
              body: dev,
              mediaUrl: null,
              description: null,
              previewType: 'PHOTO',
              thumbnailUrl: global.db.data.settings[botId].icon,
              sourceUrl: global.db.data.settings[client.user.id.split(':')[0] + "@s.whatsapp.net"].link,
              mediaType: 1,
              renderLargerThumbnail: false
            },
            mentionedJid: [jid]
          }
        }

        if (anu.action === 'add' && chat?.welcome && (!primaryBotId || primaryBotId === botId)) {
          let caption;
          if (chat.welcomeMessage && chat.welcomeMessage.trim() !== '') {
            caption = chat.welcomeMessage
              .replace(/@user/g, `@${phone}`)
              .replace(/@group/g, metadata.subject)
              .replace(/@desc/g, metadata.desc || 'Sin descripción')
              .replace(/@members/g, memberCount)
              .replace(/@time/g, `${tiempo} ${tiempo2}`);
          } else {
            caption = `╭┈──̇─̇─̇────̇─̇─̇──◯◝
┊「 *Bienvenido (⁠ ⁠ꈍ⁠ᴗ⁠ꈍ⁠)* 」
┊︶︶︶︶︶︶︶︶︶︶︶
┊  *Usuario ›* @${phone}
┊  *Grupo ›* ${metadata.subject}
┊┈─────̇─̇─̇─────◯◝
┊➤ *Usa /menu para ver los comandos.*
┊➤ *Ahora somos ${memberCount} miembros.*
┊ ︿︿︿︿︿︿︿︿︿︿︿
╰─────────────────╯`
          }
          await client.sendMessage(anu.id, { image: { url: pp }, caption, ...fakeContext })
        }

        if ((anu.action === 'remove' || anu.action === 'leave') && chat?.goodbye && (!primaryBotId || primaryBotId === botId)) {
          let caption;
          if (chat.byeMessage && chat.byeMessage.trim() !== '') {
            caption = chat.byeMessage
              .replace(/@user/g, `@${phone}`)
              .replace(/@group/g, metadata.subject)
              .replace(/@desc/g, metadata.desc || 'Sin descripción')
              .replace(/@members/g, memberCount)
              .replace(/@time/g, `${tiempo} ${tiempo2}`);
          } else {
            caption = `╭┈──̇─̇─̇────̇─̇─̇──◯◝
┊「 *Hasta pronto (⁠╥⁠﹏⁠╥⁠)* 」
┊︶︶︶︶︶︶︶︶︶︶︶
┊  *Nombre ›* @${phone}
┊┈─────̇─̇─̇─────◯◝
┊➤ *Ojalá que vuelva pronto.*
┊➤ *Ahora somos ${memberCount} miembros.*
┊ ︿︿︿︿︿︿︿︿︿︿︿
╰─────────────────╯`
          }
          await client.sendMessage(anu.id, { image: { url: pp }, caption, ...fakeContext })
        }

        if (anu.action === 'promote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const usuario = anu.author
          await client.sendMessage(anu.id, {
            text: `「✎」 *@${phone}* ha sido promovido a Administrador por *@${usuario.split('@')[0]}.*`,
            mentions: [jid, usuario]
          })
        }

        if (anu.action === 'demote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const usuario = anu.author
          await client.sendMessage(anu.id, {
            text: `「✎」 *@${phone}* ha sido degradado de Administrador por *@${usuario.split('@')[0]}.*`,
            mentions: [jid, usuario]
          })
        }
      }
    } catch (err) {
      console.log(chalk.gray(`[ EVENT  ]  → ${err}`))
    }
  })
}