import db from "#db"

export async function before({ msg, sock, groupMetadata, participants, isAdmins, isBotAdmins }) {

  if (!msg.isGroup) return;
  if (msg.isBot) return;

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

  const chat = await db.getChat(msg.chat);

  const primaryBotId = chat?.primaryBot;

  const isPrimary = !primaryBotId || primaryBotId === botId;

  if (isAdmins || !isBotAdmins || !isPrimary) {
    return;
  }

  const user = await db.getChatUser(msg.chat, msg.sender);

  if (user && user.muted === 1) {
    try {
      const deletePayload = {
        remoteJid: msg.chat,
        fromMe: false,
        id: msg.key.id,
        participant: msg.sender
      };

      await sock.sendMessage(msg.chat, { 
        delete: deletePayload
      });
    } catch (error) {
      console.error('Error al borrar mensaje de muteado:', error);
    }
  } else {
  }

}