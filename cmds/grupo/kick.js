import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

export default {
  command: ['kick'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, args, command, text, usedPrefix }) => {
    const groupInfo = await sock.groupMetadata(msg.chat);
    const ownerGroup = groupInfo.owner || msg.chat.split('-')[0] + '@s.whatsapp.net';
    const ownerBot = global.owner + '@s.whatsapp.net';
    const participants = groupInfo.participants;
    const botId = sock.decodeJid(sock.user.id);

    if (args[0] === 'num' || args[0] === 'listnum') {
      if (!args[1]) return msg.reply(`ꕤ Ingrese algún prefijo de un país\n> ✎ Ejemplo: *${usedPrefix + command} num +54*`);
      const prefix = args[1].replace(/[+]/g, '');
      const allUsersWithPrefix = participants.map(p => p.phoneNumber).filter(phoneNumber => phoneNumber !== botId && phoneNumber.startsWith(prefix));
      if (allUsersWithPrefix.length === 0) return msg.reply(`ꕤ Aquí no hay ningún número con el prefijo +${prefix}`);
      if (args[0] === 'listnum') {
        const numeros = allUsersWithPrefix.map(v => '⭔ @' + v.replace(/@.+/, ''));
        return sock.reply(msg.chat, `✎ *Lista de usuarios con prefijo +${prefix}* (${allUsersWithPrefix.length})\n\n${numeros.join('\n')}`, msg, { mentions: allUsersWithPrefix });
      }
      const usersToKick = allUsersWithPrefix.filter(user => {
        const participant = participants.find(p => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user);
        if (!participant) return false;
        if (participant.admin === 'admin' || participant.admin === 'superadmin') return false;
        if (user === ownerGroup) return false;
        if (user === ownerBot) return false;
        return true;
      });
      if (usersToKick.length === 0) {
        return msg.reply(`ꕤ Hay usuarios con prefijo +${prefix} pero todos son admins.`);
      }
      await msg.reply(`ꕤ *Eliminando usuarios con prefijo +${prefix}* (${usersToKick.length} de ${allUsersWithPrefix.length})\n> El proceso tomará unos segundos...`);
      let eliminados = 0;
      let errores = [];
      for (const user of usersToKick) {
        const participant = participants.find(p => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user);
        if (!participant) continue;
        try {
          await sock.groupParticipantsUpdate(msg.chat, [user], 'remove');
          eliminados++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (e) {
          errores.push(`@${user.split('@')[0]}: ${e.message}`);
        }
      }
      let mensajeFinal = `✎ Proceso completado.\n> Usuarios eliminados: *${eliminados}*`;
      if (errores.length > 0) {
        mensajeFinal += `\n> Errores: *${errores.length}*\n${errores.join('\n')}`;
      }
      return msg.reply(mensajeFinal);
    }

    if (args[0] === 'all') {
      const allUsers = participants.map(p => p.id);
      const usersToKick = allUsers.filter(user => {
        const participant = participants.find(p => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user);
        if (!participant) return false;
        if (user === botId) return false;
        if (user === ownerGroup) return false;
        if (user === ownerBot) return false;
        if (participant.admin === 'admin' || participant.admin === 'superadmin') return false;
        return true;
      });
      if (usersToKick.length === 0) {
        return msg.reply('ꕤ No hay usuarios para eliminar (todos son admis).');
      }
      await msg.reply(`ꕤ *Eliminando todos los usuarios* (${usersToKick.length})\n> El proceso tomará unos segundos...`);
      let eliminados = 0;
      let errores = [];
      for (const user of usersToKick) {
        const participant = participants.find(p => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user);
        if (!participant) continue;
        try {
          await sock.groupParticipantsUpdate(msg.chat, [user], 'remove');
          eliminados++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (e) {
          errores.push(`@${user.split('@')[0]}: ${e.message}`);
        }
      }
      let mensajeFinal = `✎ Proceso completado.\n> Usuarios eliminados: *${eliminados}*`;
      if (errores.length > 0) {
        mensajeFinal += `\n> Errores: *${errores.length}*\n${errores.join('\n')}`;
      }
      return msg.reply(mensajeFinal);
    }

    if (args[0] === 'inactive' || args[0] === 'listinactive') {
      const allChatUsers = await getChatUser(msg.chat);
      const now = new Date();
      let daysArg = 30;
      const cutoff = new Date(now.getTime() - daysArg * 24 * 60 * 60 * 1000);
      let sider = [];
      for (const participant of participants) {
        const user = participant.id;
        if (user === botId) continue;
        if (user === ownerGroup) continue;
        if (user === ownerBot) continue;
        if (participant.admin === 'admin' || participant.admin === 'superadmin') continue;
        const userStats = allChatUsers.find(u => {
          const participantFound = participants.find(p => p.phoneNumber === u.user_id || p.jid === u.user_id || p.id === u.user_id || p.lid === u.user_id);
          return participantFound?.id === user;
        });
        if (userStats) {
          const days = Object.entries(userStats.stats || {}).filter(([date]) => new Date(date) >= cutoff);
          const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0);
          if (totalMsgs === 0) {
            sider.push(user);
          }
        } else {
          sider.push(user);
        }
      }
      if (sider.length === 0) return msg.reply('ꕤ Este grupo es activo, no tiene inactivos.');
      if (args[0] === 'listinactive') {
        return sock.reply(msg.chat, `✎ *Lista de inactivos* (${sider.length})\n\n${sider.map(v => '⭔ @' + v.replace(/@.+/, '')).join('\n')}`, msg, { mentions: sider });
      }
      await msg.reply(`ꕤ *Eliminando inactivos* (${sider.length})\n> El proceso tomará unos segundos...`);
      let eliminados = 0;
      let errores = [];
      for (const user of sider) {
        const participant = participants.find(p => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user);
        if (!participant) continue;
        try {
          await sock.groupParticipantsUpdate(msg.chat, [user], 'remove');
          eliminados++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (e) {
          errores.push(`@${user.split('@')[0]}: ${e.message}`);
        }
      }
      let mensajeFinal = `✎ Proceso completado. usuarios eliminados: *${eliminados}*`;
      if (errores.length > 0) {
        mensajeFinal += `\n> Errores: *[${errores.join('\n')}]*`;
      }
      return msg.reply(mensajeFinal);
    }

    if (!msg.mentionedJid[0] && !msg.quoted) {
      return msg.reply(`《✤》 Por favor, Etiqueta o responde al *mensaje* de la *persona* que quieres eliminar.\n\n✎ *Opciones especiales:*\n> *${usedPrefix + command} num +57* - Eliminar todos los usuarios con prefijo +57\n> *${usedPrefix + command} listnum +56* - Listar usuarios con prefijo +56\n> *${usedPrefix + command} all* - Eliminar todos los usuarios\n> *${usedPrefix + command} inactive* - Eliminar usuarios inactivos últimos (30 días)\n> *${usedPrefix + command} listinactive* - Listas inactivos`);
    }

    if (msg.mentionedJid.length > 1) {
      let eliminados = 0;
      let errores = [];
      for (const user of msg.mentionedJid) {
        const participant = participants.find(p => p.id === user || p.jid === user || p.lid === user);
        if (!participant) {
          errores.push(`@${user.split('@')[0]}: no está en el grupo`);
          continue;
        }
        if (user === botId || user === ownerGroup || user === ownerBot) {
          errores.push(`@${user.split('@')[0]}: no se puede eliminar`);
          continue;
        }
        if (participant.admin === 'admin' || participant.admin === 'superadmin') {
          errores.push(`@${user.split('@')[0]}: es admin`);
          continue;
        }
        try {
          await sock.groupParticipantsUpdate(msg.chat, [user], 'remove');
          eliminados++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (e) {
          errores.push(`@${user.split('@')[0]}: ${e.message}`);
        }
      }
      let mensajeFinal = `✎ Proceso completado.\n> Usuarios eliminados: *${eliminados}*`;
      if (errores.length > 0) {
        mensajeFinal += `\n> Errores: *${errores.length}*\n${errores.join('\n')}`;
      }
      return msg.reply(mensajeFinal);
    }

    let user = msg.mentionedJid[0] ? msg.mentionedJid[0] : msg.quoted.sender;
    const participant = groupInfo.participants.find((p) => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user);
    if (!participant) {
      return sock.reply(msg.chat, `✎ @${user.split('@')[0]} ya no está en el grupo.`, msg, { mentions: [user] });
    }
    if (user === sock.decodeJid(sock.user.id)) {
      return msg.reply('ꕤ No puedo eliminar al *bot* del grupo');
    }
    if (user === ownerGroup) {
      return msg.reply('ꕤ No puedo eliminar al *propietario* del grupo');
    }
    if (user === ownerBot) {
      return msg.reply('ꕤ No puedo eliminar al *propietario* del bot');
    }
    try {
      await sock.groupParticipantsUpdate(msg.chat, [user], 'remove');
      sock.reply(msg.chat, `✎ @${user.split('@')[0]} *eliminado* correctamente`, msg, { mentions: [user] });
    } catch (e) {
      return msg.reply(msgglobal);
    }
  },
};