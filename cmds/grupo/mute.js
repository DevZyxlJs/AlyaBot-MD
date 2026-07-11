import db from "#db"

export default {
  command: ['mute', 'unmute', 'mutelist'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, args, command }) => {
    const chat = await db.getChat(msg.chat)
    const mentioned = msg.mentionedJid
    const targetId = mentioned.length > 0
      ? mentioned[0]
      : msg.quoted
      ? msg.quoted.sender
      : false

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    const isTargetAdmin = async (jid) => {
      try {
        const groupMetadata = await sock.groupMetadata(msg.chat);
        const participants = groupMetadata.participants || [];
        const target = participants.find(p => p.id === jid);
        return target?.admin === 'admin' || target?.admin === 'superadmin';
      } catch {
        return false;
      }
    };

    if (command === 'mute') {
      const reason = mentioned.length > 0
        ? args.slice(1).join(' ') || 'Sin razón.'
        : args.slice(0).join(' ') || 'Sin razón.'

      try {
        if (!targetId) return msg.reply('《✤》 Debes mencionar o responder al usuario que deseas mutear.')

        if (targetId === botId) {
          return msg.reply('《✤》 No puedes mutear al bot.')
        }

        const isAdmin = await isTargetAdmin(targetId);
        if (isAdmin) {
          return msg.reply(`《✤》 No puedes mutear a un administrador del grupo.`)
        }

        const user = await db.getChatUser(msg.chat, targetId)

        if (user.muted === 1) {
          return msg.reply(`《✤》 El usuario @${targetId.split('@')[0]} ya está muteado.`, { mentions: [targetId] })
        }

        await db.setChatUser(msg.chat, targetId, 'muted', 1)
        await db.setChatUser(msg.chat, targetId, 'mutedReason', reason)

        const nam = await db.getUser(targetId)
        const name = nam.name || 'Usuario'

        const message = `✐ Se ha muteado a @${targetId.split('@')[0]}.\n> ✿ Razón: *${reason}*`

        await sock.reply(msg.chat, message, msg, { mentions: [targetId] })
      } catch (e) {
        console.error(e)
        msg.reply(msgglobal)
      }
    }

    else if (command === 'unmute') {
      try {
        if (!targetId) return msg.reply('《✤》 Debes mencionar o responder al usuario que deseas desmutear.')

        if (targetId === botId) {
          return msg.reply('《✤》 El bot no está muteado.')
        }

        const user = await db.getChatUser(msg.chat, targetId)

        if (user.muted === 0) {
          return msg.reply(`《✤》 El usuario @${targetId.split('@')[0]} no está muteado.`, { mentions: [targetId] })
        }

        await db.setChatUser(msg.chat, targetId, 'muted', 0)
        await db.setChatUser(msg.chat, targetId, 'mutedReason', '')

        const nam = await db.getUser(targetId)
        const name = nam.name || 'Usuario'

        const message = `✐ Se ha desmuteado a @${targetId.split('@')[0]}.`

        await sock.reply(msg.chat, message, msg, { mentions: [targetId] })
      } catch (e) {
        console.error(e)
        msg.reply(msgglobal)
      }
    }

    else if (command === 'mutelist') {
      try {
        const allUsers = await db.getChatUser(msg.chat)
        const mutedUsers = allUsers.filter(u => u.muted === 1)

        if (mutedUsers.length === 0) {
          return msg.reply('《✤》 No hay usuarios muteados en este grupo.')
        }

        let listMessage = '✐ Lista de usuarios muteados:\n\n'

        for (const user of mutedUsers) {
          const userData = await db.getUser(user.user_id)
          const name = userData.name || user.user_id.split('@')[0]
          const reason = user.mutedReason || 'Sin razón'
          listMessage += `✦ @${user.user_id.split('@')[0]}\n`
          listMessage += `  ❯ Razón: ${reason}\n\n`
        }

        const mentions = mutedUsers.map(u => u.user_id)
        await sock.reply(msg.chat, listMessage, msg, { mentions })
      } catch (e) {
        console.error(e)
        msg.reply(msgglobal)
      }
    }
  }
}