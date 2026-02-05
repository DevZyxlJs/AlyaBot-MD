import fetch from 'node-fetch';
import FormData from 'form-data';

export default {
  command: ['hd'],
  category: 'utils',
    run: async (client, m, args, command, text, prefix) => {
    try {
      const q = m.quoted || m
      const mime = q.mimetype || q.msg?.mimetype || ''

      if (!mime) return m.reply(`🍒 Envía una *imagen* junto al *comando* ${prefix + command}`)
      if (!/image\/(jpe?g|png)/.test(mime)) {
        return m.reply(`🌾 El formato *${mime}* no es compatible`)
      }

     // await m.reply(mess.wait)

      const buffer = await q.download()
      const uploadedUrl = await uploadToUguu(buffer)
      if (!uploadedUrl) {
        return m.reply('🌱 No se pudo *subir* la imagen')
      }

      const enhancedBuffer = await getEnhancedBuffer(uploadedUrl)
      if (!enhancedBuffer) {
        return m.reply('🦩 No se pudo *obtener* la imagen mejorada')
      }

      await client.sendMessage(m.chat, { image: enhancedBuffer, caption: null }, { quoted: m })
    } catch (err) {
      console.error(err)
      await m.reply(msgglobal)
    }
  },
};

async function uploadToUguu(buffer) {
  const body = new FormData()
  body.append('files[]', buffer, 'image.jpg')

  const res = await fetch('https://uguu.se/upload.php', {
    method: 'POST',
    body,
    headers: body.getHeaders(),
  })

  const json = await res.json()
  return json.files?.[0]?.url
}

async function getEnhancedBuffer(url) {
  const res = await fetch(`${api.url}/tools/upscale?url=${url}&key=${api.key}`)
  if (!res.ok) return null

  return Buffer.from(await res.arrayBuffer())
}
