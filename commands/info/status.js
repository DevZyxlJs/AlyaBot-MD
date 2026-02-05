import fs from 'fs';
import os from 'os';

function getDefaultHostId() {
  if (process.env.HOSTNAME) {
    return process.env.HOSTNAME.split('-')[0]
  }
  return 'default_host_id'
}

export default {
  command: ['status'],
  category: 'info',
  run: async (client, m) => {

    const hostId = getDefaultHostId()
    const registeredGroups = global.db.data.chats ? Object.keys(global.db.data.chats).length : 0
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net" || false
    const botSettings = global.db.data.settings[botId] || {}

    const botname = botSettings.namebot || 'Ai Surus'
    const comandos = botSettings.commandsejecut || '0'
    const botname2 = botSettings.namebot2 || 'Surus'
    const userCount = Object.keys(global.db.data.users).length || '0'

    const estadoBot = 
`> ❑  ˖⁩   ౼ Estatus :: *${botname2}*

ׅ  ׄ  ✿   ׅ り Users Registrados :: *${userCount.toLocaleString()}*
ׅ  ׄ  ✿   ׅ り Grupos Registrados :: *${registeredGroups.toLocaleString()}*
ׅ  ׄ  ✿   ׅ り 𝖢𝗆𝖽 𝖤𝗃𝖾𝖼 :: *${comandos.toLocaleString()}*`

    const sistema = os.type()
    const cpu = os.cpus().length
    const ramTotal = (os.totalmem() / 1024 ** 3).toFixed(2)
    const ramUsada = ((os.totalmem() - os.freemem()) / 1024 ** 3).toFixed(2)
    const arquitectura = os.arch()

    const estadoServidor = 
`𖹭᳔ㅤㅤㅤׄㅤㅤꕤㅤㅤׅㅤㅤゕㅤㅤׄㅤㅤㅤ𑄾𑄾

ׅ  ׄ  ✤   ׅ り Sistema :: *${sistema}*
ׅ  ׄ  ✤   ׅ り Cpu :: *${cpu} cores*
ׅ  ׄ  ✤   ׅ り Ram :: *${ramTotal} GB*
ׅ  ׄ  ✤   ׅ り Ram Usado :: *${ramUsada} GB*
ׅ  ׄ  ✤   ׅ り Arquitectura :: *${arquitectura}*
ׅ  ׄ  ✤   ׅ り Host ID :: *${hostId}*`

    const message = `${estadoBot}\n\n${estadoServidor}`

        await client.sendContextInfoIndex(m.chat, message, {}, m, true, {})
  }
};