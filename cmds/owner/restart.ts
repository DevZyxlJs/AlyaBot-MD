export default {
  command: ['restart'],
  category: 'mod',
  isOwner: true,
  async run(sock, m) {
    await sock.reply(m.chat, `✎ Reiniciando el Socket...\n> *Espere un momento...*`, m)
    setTimeout(() => {
      process.exit(0)
    }, 3000)
  },
};