import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'

global.owner = ['5492916450307', '573196588149', '5218711426787']
global.sessionName = 'Sessions/Owner'

global.api = {
  url: 'https://api.stellarwa.xyz',
  key: '' 
}

global.msgglobal = '⋆˚𝜗 There was a problem processing the request, contact the creator or a moderator to fix this issue. (✿◡‿◡)'
global.dev = `ᴍᴀᴅᴇ ᴡɪᴛʜ ʙʏ ɪ'ᴍ ᴅɪᴇɢᴏ ッ`

global.mess = {
  socket: '(∩´͈ ᴖ `͈∩ ྀི) Este comando solo puede ser ejecutado por un Socket.',
  admin: '٩ʕ◕౪◕ʔو Este comando solo puede ser ejecutado por los Administradores del Grupo.',
  botAdmin: '(𓂂꜆◕⩊◕꜀𓂂) Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo.',
  nsfw: '(•ૢ⚈͒⌄⚈͒•ૢ) Los comandos de *NSFW* están desactivados en este grupo.',
  comandooff: 'ღゝ◡╹ )ノ Estos comandos estan desactivados en este grupo.'
}

global.my = {
ch: "120363420992828502@newsletter", // Oficial
ch2: "120363405689107729@newsletter", // Api
ch3: "120363401404146384@newsletter" // Yuki
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  import(`${file}?update=${Date.now()}`)
})