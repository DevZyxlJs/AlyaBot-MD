import cp from 'child_process'
import { promisify } from 'util'
const exec = promisify(cp.exec)

export default {
  command: ['r'],
  isOwner: true,
  run: async (client, m, args) => {
    const cmd = args.join(' ').trim()
    if (!cmd) {
      return // client.reply(m.chat, '❌ Escribe un comando para ejecutar.\nEjemplo: .r ls', m)
    }
    let result
    try {
      result = await exec(cmd)
    } catch (e) {
      result = e
    }
    const { stdout, stderr } = result
    if (stdout?.trim()) {
      client.reply(m.chat, stdout.trim(), m)
    }
    if (stderr?.trim()) {
      client.reply(m.chat, stderr.trim(), m)
    }
  }
}
