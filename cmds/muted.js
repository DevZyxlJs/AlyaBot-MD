import db from "#db"

export async function before({ msg, sock }) {
  if (!msg.isGroup) return;
  if (msg.isBot) return;

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const chat = await db.getChat(msg.chat);
  const primaryBotId = chat?.primaryBot;

  if (primaryBotId && primaryBotId !== botId) return;

  const user = await db.getChatUser(msg.chat, msg.sender);

  if (user?.muted === 1) {
    try {
      const deleteObj = {
        remoteJid: msg.chat,
        fromMe: false,
        id: msg.key.id,
        participant: msg.sender
      };
      await sock.sendMessage(msg.chat, { delete: deleteObj }).catch(err => console.error('Error al borrar mensaje de muteado:', err)); 
    } catch (error) {
      console.error('Error al procesar mensaje de usuario muteado:', error);
      return;
    }
  }
}