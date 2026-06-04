import axios from "axios"
import FormData from "form-data"

function formatBytes(bytes) {
  if (bytes === 0) return "0 B"
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

function generateUniqueFilename(mime) {
  const ext = mime.split("/")[1] || "bin"
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `${id}.${ext}`
}

async function uploadUguu(buffer, mime) {
  const form = new FormData()
  form.append("files[]", buffer, generateUniqueFilename(mime))

  const res = await axios.post("https://uguu.se/upload.php", form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })

  const data = res.data
  const url = data?.files?.[0]?.url
  if (!url) throw new Error("Respuesta inválida de Uguu: " + JSON.stringify(data))
  return url
}

export default {
  command: ["tourl"],
  category: "utils",
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const q = msg.quoted || msg
    const mime = (q.msg || q).mimetype || ""
    if (!mime) {
      return sock.reply(
        m.chat,
        `✿ Responde a una imagen o video con *${prefix + command}* para convertirlo en URL.`,
        m
      )
    }

    try {
      const media = await q.download()
      if (!media) return msg.reply("ꕥ No se pudo descargar el archivo.")

      const link = await uploadUguu(media, mime)
      const userName = msg.pushName || "Usuario"

      const upload = `𖹭 ❀ *Upload To UGUU*\n\n` +
        `ׅ  ׄ  ✿   ׅ り *Link ›* ${link}\n` +
        `ׅ  ׄ  ✿   ׅ り *Peso ›* ${formatBytes(media.length)}\n` +
        `ׅ  ׄ  ✿   ׅ り *Tipo ›* ${mime.split("/")[1]?.toUpperCase() || "UNKNOWN"}\n` +
        `ׅ  ׄ  ✿   ׅ り *Solicitado por ›* ${userName}\n\n${dev}`

      await msg.reply(upload)
    } catch (e) {
      console.error(e)
      await msg.reply(`${msgglobal}`)
    }
  }
}
