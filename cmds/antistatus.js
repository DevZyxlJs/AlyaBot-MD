import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

export async function before({ msg, sock, groupMetadata, participants, isAdmins, isBotAdmins }) {
  if (!msg.isGroup) return;
  if (msg.isBot) return;
  
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  if (!groupMetadata) return;
  
  const botSettings = await getSettings(botId);
  const isSelf = botSettings?.self ?? 0;
  if (isSelf) return;
  
  const chat = await getChat(msg.chat);
  const primaryBotId = chat?.primaryBot;
  const isPrimary = !primaryBotId || primaryBotId === botId;
  
  const isEstado = msg.quoted?.groupStatusMentionMessage || 
                   msg.quoted?.type === 'groupStatusMentionMessage' || 
                   msg.message?.groupStatusMentionMessage ||
                   (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.groupStatusMentionMessage);

  if (!isEstado || !chat?.antistatus || isAdmins || !isBotAdmins || !isPrimary) return;

  try {
    let deleteObj = null;
    let participantToUse = null;

    if (msg.quoted && (msg.quoted.groupStatusMentionMessage || msg.quoted.type === 'groupStatusMentionMessage')) {
      const quotedKey = msg.quoted.key;
      participantToUse = quotedKey.participantAlt || (quotedKey.participant ? quotedKey.participant.split(':')[0] + '@s.whatsapp.net' : msg.sender);
      deleteObj = { remoteJid: msg.chat, fromMe: false, id: quotedKey.id, participant: participantToUse };
    } else if (msg.message?.groupStatusMentionMessage) {
      participantToUse = msg.key.participantAlt || (msg.key.participant ? msg.key.participant.split(':')[0] + '@s.whatsapp.net' : msg.sender);
      deleteObj = { remoteJid: msg.chat, fromMe: false, id: msg.key.id, participant: participantToUse };
    } else if (msg.message?.extendedTextMessage?.contextInfo) {
      const contextInfo = msg.message.extendedTextMessage.contextInfo;
      if (contextInfo.quotedMessage?.groupStatusMentionMessage || contextInfo.stanzaId) {
        participantToUse = (contextInfo.participant ? contextInfo.participant.split(':')[0] + '@s.whatsapp.net' : null) || msg.sender;
        deleteObj = { remoteJid: msg.chat, fromMe: false, id: contextInfo.stanzaId, participant: participantToUse };
      }
    }

    if (deleteObj) {
      await sock.sendMessage(msg.chat, { delete: deleteObj }).catch(err => console.error('Error al borrar status:', err));
      
      const currentParticipant = msg.key.participantAlt || (msg.key.participant ? msg.key.participant.split(':')[0] + '@s.whatsapp.net' : msg.sender);
      const currentDeleteObj = { remoteJid: msg.chat, fromMe: false, id: msg.key.id, participant: currentParticipant };
      
      if (currentDeleteObj.id !== deleteObj.id) {
        await sock.sendMessage(msg.chat, { delete: currentDeleteObj }).catch(err => console.error('Error al borrar comando actual:', err));
      }
    }

    const targetId = msg.sender;
    
    let user = await getChatUser(msg.chat, targetId);
    if (!user) {
        user = { warnings: [] }; 
    }
    
    if (!user.warnings) user.warnings = [];
    let warnings = user.warnings;
    
    if (typeof warnings === 'string') {
      try { warnings = JSON.parse(warnings); } catch { warnings = []; }
    }
    if (!Array.isArray(warnings)) warnings = [];

    const now = new Date();
    const timestamp = now.toLocaleString('es-CO', { 
      timeZone: 'America/Bogota', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    warnings.unshift({ reason: 'Anti-Status detectado', timestamp, by: botId });
    
   // user.warnings = warnings;
    
    await updateChatUser(msg.chat, targetId, 'warnings', warnings);
   
    const total = warnings.length;
    const warnLimit = chat.warnLimit || 3;
    const expulsar = chat.expulsar === 1;

    const warningList = warnings.map((w, i) => {
      const index = total - i;
      return `\`#${index}\` » ${w.reason}\n> » Fecha: ${w.timestamp}`;
    }).join('\n');

    let message = `✐ Se ha añadido una advertencia automática a @${targetId.split('@')[0]} por *Anti-Status*.\n✿ Advertencias totales \`(${total})\`:\n\n${warningList}`;

    if (total >= warnLimit && expulsar) {
      try {
        await sock.groupParticipantsUpdate(msg.chat, [targetId], 'remove');
       // user.warnings = [];
        await updateChatUser(msg.chat, targetId, 'warnings', []);
        message += `\n\n> ❖ El usuario alcanzó el límite de advertencias y fue expulsado del grupo.`;
      } catch {
        message += `\n\n> ❖ El usuario alcanzó el límite, pero no se pudo expulsar automáticamente.`;
      }
    } else if (total >= warnLimit && !expulsar) {
      message += `\n\n> ❖ El usuario ha alcanzado el límite de advertencias.`;
    }

    await sock.reply(msg.chat, message, msg, { mentions: [targetId] });

  } catch (error) {
    console.error('Error general en Anti-Estado:', error);
  }
}
