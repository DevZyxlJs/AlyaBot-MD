import axios from "axios"

export default {
  command: ["fb", "facebook"],
  category: "downloader",
  run: async ({ msg, sock, args, command }) => {

    if (!args.length) {
      return msg.reply("✎ Ingrese uno o varios enlaces o texto para buscar en *Facebook*")
    }

    const urls = args.filter(arg => arg.match(/facebook\.com|fb\.watch|video\.fb\.com/))

    try {
      if (urls.length) {
        if (urls.length > 1) {
          const medias = []
          for (const url of urls.slice(0, 10)) {
            try {
              const apiUrl = `${api.url}/dl/facebook?url=${url}&key=${api.key}`
              const res = await axios.get(apiUrl, { responseType: "arraybuffer" })
              const buffer = Buffer.from(res.data)

              medias.push({
                type: "video",
                data: buffer
              })
            } catch (e) {
              continue
            }
          }
          if (medias.length) {
            await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
          } else {
            await msg.reply(`✿ No se pudieron procesar los enlaces.`)
          }
        } else {
          const url = urls[0]
          const apiUrl = `${api.url}/dl/facebook?url=${url}&key=${api.key}`
          const res = await axios.get(apiUrl, { responseType: "arraybuffer" })
          const buffer = Buffer.from(res.data)

          await sock.sendMessage(
            msg.chat,
            { video: buffer, mimetype: "video/mp4", fileName: "fb.mp4" },
            { quoted: msg }
          )
        }
      } else {
        const query = args.join(" ")
        const searchUrl = `${api.url}/search/facebook?query=${encodeURIComponent(query)}&key=${api.key}`
        const res = await axios.get(searchUrl)
        const json = res.data

        if (!json.status || !json.data || !json.data.length) {
          return msg.reply(`✿ No se encontraron resultados para "${query}".`)
        }

        const medias = []
        for (const item of json.data.slice(0, 3)) {
          try {
            const apiUrl = `${api.url}/dl/facebook?url=${item.url}&key=${api.key}`
            const resDl = await axios.get(apiUrl, { responseType: "arraybuffer" })
            const buffer = Buffer.from(resDl.data)

            medias.push({
              type: "video",
              data: buffer
            })
          } catch (e) {
            continue
          }
        }

        if (medias.length) {
          await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
        } else {
          await msg.reply(`✿ No se pudieron descargar los resultados.`)
        }
      }
    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}