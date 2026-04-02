import axios from "axios"
import FormData from "form-data"

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

function generateUniqueFilename(mime: string): string {
  const ext = mime.split("/")[1] || "bin"
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `${id}.${ext}`
}

async function uploadCatbox(buffer: Buffer, mime: string): Promise<string> {
  const form = new FormData()
  form.append("reqtype", "fileupload")
  form.append("fileToUpload", buffer, { filename: generateUniqueFilename(mime) })

  const res = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })

  if (typeof res.data !== "string" || !res.data.startsWith("https://")) {
    throw new Error("Respuesta inválida de Catbox: " + JSON.stringify(res.data))
  }
  return res.data
}

async function uploadUguu(buffer: Buffer): Promise<string> {
  const form = new FormData()
  form.append("files[]", buffer, generateUniqueFilename("image/jpeg"))

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

async function uploadQuax(buffer: Buffer, mime: string): Promise<string> {
  const form = new FormData()
  form.append("file", buffer, { filename: generateUniqueFilename(mime), contentType: mime })

  const res = await axios.post("https://qu.ax/upload.php", form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })

  const data = res.data
  if (!data?.files?.[0]?.url) throw new Error("Respuesta inválida de Quax: " + JSON.stringify(data))
  return data.files[0].url
}

async function uploadAuto(buffer: Buffer, mime: string): Promise<{ link: string, server: string }> {
  try {
    return { link: await uploadCatbox(buffer, mime), server: "catbox" }
  } catch {
    try {
      return { link: await uploadUguu(buffer), server: "uguu" }
    } catch {
      return { link: await uploadQuax(buffer, mime), server: "quax" }
    }
  }
}

export default {
  command: ["tourl"],
  category: "utils",
  run: async (client: any, m: any, args: string[], command: string, text: string, prefix: string) => {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ""
    if (!mime) {
      return client.reply(
        m.chat,
        `✿ Responde a una imagen o video con *${prefix + command}  [servidor]* para convertirlo en URL.\n\n` +
        `Servidores disponibles:\n` +
        `› catbox (permanente)\n` +
        `› quax   (permanente)\n` +
        `› uguu   (temporal, 24h)`,
        m
      )
    }

    try {
      const media = await q.download()
      if (!media) return m.reply("ꕥ No se pudo descargar el archivo.")

      const serverArg = args[0]?.toLowerCase() || "auto"
      let link: string, server: string

      if (serverArg === "catbox") {
        link = await uploadCatbox(media, mime)
        server = "catbox"
      } else if (serverArg === "uguu") {
        link = await uploadUguu(media)
        server = "uguu"
      } else if (serverArg === "quax") {
        link = await uploadQuax(media, mime)
        server = "quax"
      } else {
        const autoRes = await uploadAuto(media, mime)
        link = autoRes.link
        server = autoRes.server
      }

      const userName = m.pushName || "Usuario"
      const upload = `𖹭 ❀ *Upload To ${server.toUpperCase()}*\n\n` +
        `ׅ  ׄ  ✿   ׅ り *Link ›* ${link}\n` +
        `ׅ  ׄ  ✿   ׅ り *Peso ›* ${formatBytes(media.length)}\n` +
        `ׅ  ׄ  ✿   ׅ り *Tipo ›* ${mime.split("/")[1].toUpperCase() || "UNKNOWN"}\n` +
        `ׅ  ׄ  ✿   ׅ り *Solicitado por ›* ${userName}\n\n${dev}`

      await client.sendContextInfoIndex(m.chat, upload, {}, m, true, {
        thumbnail: media
      })
    } catch (e) {
      console.error(e)
      await m.reply(`${msgglobal}`)
    }
  }
}