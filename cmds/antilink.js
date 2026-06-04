import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

const linkRegex = /(https?:\/\/)?(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|whatsapp\.com\/channel\/[0-9A-Za-z]{20,24})/i

const joinCommands = [
  '/invite', '#invite', '-invite',
  '!invite', '.invite', '+invite'
]

export async function before({ msg, sock, groupMetadata, participants, isAdmins, isBotAdmins }) {
  if (!msg.isGroup || !msg.text) return;
  if (msg.isBot) return;

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  if (!groupMetadata) return;

  const botSettings = await getSettings(botId);
  const isSelf = botSettings?.self ?? 0;
  if (isSelf) return;

  const chat = await getChat(msg.chat);
  const primaryBotId = chat?.primaryBot;
  const isPrimary = !primaryBotId || primaryBotId === botId;

  const isGroupLink = linkRegex.test(msg.text);
  const command = msg.text.trim().split(/\s+/)[0].toLowerCase();

  if (!isGroupLink || !chat?.antilinks || isAdmins || !isBotAdmins || !isPrimary) return;

  await sock.sendMessage(msg.chat, {
    delete: {
      remoteJid: msg.chat,
      fromMe: false,
      id: msg.key.id,
      participant: msg.key.participant
    }
  }).catch(() => {});

  if (!joinCommands.includes(command)) {
    
    if (msg.quoted?.key?.id) {
      await sock.sendMessage(msg.chat, {
        delete: {
          remoteJid: msg.chat,
          fromMe: false,
          id: msg.quoted.key.id,
          participant: msg.quoted.key.participant
        }
      }).catch(() => {});
    }

    const ysr = await getUser(msg.sender);
    const userName = ysr?.name || msg.pushName || 'Usuario';

    setTimeout(async () => {
      try {
        await sock.reply(msg.chat, `❖ *${userName}* eliminado por \`Anti-Link\``, null);
        await sock.groupParticipantsUpdate(msg.chat, [msg.sender], 'remove');
      } catch (err) {
        console.error('Error al expulsar en Anti-Link:', err);
      }
    }, 500);
  }
}