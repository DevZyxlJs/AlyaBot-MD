import fs from 'fs'
import sharp from 'sharp'
import exif from '../../lib/exif.js'
const { writeExif } = exif

export default {
  command: ['sticker', 's'],
    category: 'utils',
    run: async (client, m, args, command, text, prefix) => {
    try {
      if (args[0] === '-list') {
        let helpText = `❖ Lista de Formas y Efectos Disponibles para *imagen*:\n\n❑ *Formas:*\n- -c : Crea un sticker circular\n- -t : Crea un sticker triangular\n- -s : Crea un sticker con forma de estrella\n- -r : Crea un sticker con esquinas redondeadas\n- -h : Crea un sticker hexagonal\n- -d : Crea un sticker con forma de diamante\n- -f : Crea un sticker con un marco\n- -b : Crea un sticker con un borde\n- -w : Crea un sticker con forma de onda\n- -m : Crea un sticker espejado\n- -o : Crea un sticker octogonal\n- -y : Crea un sticker pentagonal\n- -e : Crea un sticker elíptico\n- -z : Crea un sticker en forma de cruz\n- -v : Crea un sticker con forma de corazón\n- -x : Crea un sticker expandido (cover)\n- -i : Crea un sticker expandido (contain)\n\n❑ *Efectos:*\n- -blur : Aplica un efecto de desenfoque\n- -sepia : Aplica un efecto sepia\n- -sharpen : Aplica un efecto de nitidez\n- -brighten : Aumenta el brillo\n- -darken : Disminuye el brillo\n- -invert : Invierte los colores\n- -grayscale : Aplica escala de grises\n- -rotate90 : Rota la imagen 90 grados\n- -rotate180 : Rota la imagen 180 grados\n- -flip : Invierte la imagen horizontalmente\n- -flop : Invierte la imagen verticalmente\n- -normalice : Normaliza la imagen\n- -negate : Negatiza la imagen\n- -tint : Aplica un tinte de color a la imagen (rojo por defecto)\n\n> Ejemplo: *${prefix + command} -c -blur Pack • Autor*`
        return client.reply(m.chat, helpText, m)
      }      
      const quoted = m.quoted ? m.quoted : m
      const mime = (quoted.msg || quoted).mimetype || ''      
      let user = globalThis.db.data.users[m.sender] || {}
      const name = user.name
      let texto1 = user.metadatos || `S'ᴛᴇʟʟᴀʀ 🧠 WᴀBᴏᴛ`;
      let texto2 = user.metadatos2 || `@${name}`;      
      let urlArg = null
      let argsWithoutUrl = []      
      for (let arg of args) {
        if (isUrl(arg)) {
          urlArg = arg
        } else {
          argsWithoutUrl.push(arg)
        }
      }      
      let filteredText = argsWithoutUrl.join(' ').replace(/-\w+/g, '').trim()
      let marca = filteredText.split(/[\u2022|]/).map(part => part.trim())
      let pack = marca[0] || texto1
      let author = marca.length > 1 ? marca[1] : texto2      
      const shapeArgs = { '-c': 'circle', '-t': 'triangle', '-s': 'star', '-r': 'roundrect', '-h': 'hexagon', '-d': 'diamond', '-f': 'frame', '-b': 'border', '-w': 'wave', '-m': 'mirror', '-o': 'octagon', '-y': 'pentagon', '-e': 'ellipse', '-z': 'cross', '-v': 'heart', '-x': 'cover', '-i': 'expand' }      
      const effectArgs = { '-blur': 'blur', '-sepia': 'sepia', '-sharpen': 'sharpen', '-brighten': 'brighten', '-darken': 'darken', '-invert': 'invert', '-grayscale': 'grayscale', '-rotate90': 'rotate90', '-rotate180': 'rotate180', '-flip': 'flip', '-flop': 'flop', '-normalice': 'normalise', '-negate': 'negate', '-tint': 'tint' }      
      const effects = []
      for (const arg of argsWithoutUrl) {
        if (shapeArgs[arg]) effects.push({ type: 'shape', value: shapeArgs[arg] })
        else if (effectArgs[arg]) effects.push({ type: 'effect', value: effectArgs[arg] })
      }      
      const processImage = async (buffer, isWebpAnimated = false) => {
        if (isWebpAnimated) {
          return buffer
        }        
        let image = sharp(buffer).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        const shape = effects.find(e => e.type === 'shape')
        if (shape) {
          const masks = { circle: `<svg width="512" height="512"><circle cx="256" cy="256" r="256" fill="white"/></svg>`, triangle: `<svg width="512" height="512"><polygon points="256,0 512,512 0,512" fill="white"/></svg>`, star: `<svg width="512" height="512"><polygon points="256,20 298,190 478,190 330,290 380,460 256,360 132,460 182,290 34,190 214,190" fill="white"/></svg>`, roundrect: `<svg width="512" height="512"><rect x="0" y="0" width="512" height="512" rx="100" ry="100" fill="white"/></svg>`, hexagon: `<svg width="512" height="512"><polygon points="256,0 450,128 450,384 256,512 62,384 62,128" fill="white"/></svg>`, diamond: `<svg width="512" height="512"><polygon points="256,0 512,256 256,512 0,256" fill="white"/></svg>`, frame: `<svg width="512" height="512"><rect x="20" y="20" width="472" height="472" rx="20" ry="20" fill="none" stroke="white" stroke-width="40"/></svg>`, wave: `<svg width="512" height="512"><path d="M0,320 C150,400 350,200 512,320 L512,0 L0,0 Z" fill="white"/></svg>`, octagon: `<svg width="512" height="512"><polygon points="161,0 351,0 512,161 512,351 351,512 161,512 0,351 0,161" fill="white"/></svg>`, pentagon: `<svg width="512" height="512"><polygon points="256,0 512,196 412,512 100,512 0,196" fill="white"/></svg>`, ellipse: `<svg width="512" height="512"><ellipse cx="256" cy="256" rx="256" ry="150" fill="white"/></svg>`, cross: `<svg width="512" height="512"><polygon points="236,0 276,0 276,236 512,236 512,276 276,276 276,512 236,512 236,276 0,276 0,236 236,236" fill="white"/></svg>`, heart: `<svg width="512" height="512"><path d="M256 480 L 47 273 C 18 244 0 207 0 170 C 0 87 67 20 150 20 C 202 20 256 64 256 64 C 256 64 309 20 362 20 C 445 20 512 87 512 170 C 512 207 494 244 465 273 L 256 480 Z" fill="white"/></svg>` }          
          if (shape.value === 'cover') {
            image = sharp(buffer).resize(512, 512, { fit: 'cover' })
          } else if (shape.value === 'expand') {
            image = sharp(buffer).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          } else if (masks[shape.value]) {
            image = image.composite([{ input: Buffer.from(masks[shape.value]), blend: 'dest-in' }])
          }
        }        
        for (const effect of effects) {
          if (effect.type === 'effect') {
            switch (effect.value) {
              case 'blur': image = image.blur(5); break
              case 'sepia': image = image.recomb([[0.393,0.769,0.189],[0.349,0.686,0.168],[0.272,0.534,0.131]]); break
              case 'sharpen': image = image.sharpen(); break
              case 'brighten': image = image.modulate({ brightness: 1.2 }); break
              case 'darken': image = image.modulate({ brightness: 0.8 }); break
              case 'invert': image = image.negate(); break
              case 'grayscale': image = image.greyscale(); break
              case 'rotate90': image = image.rotate(90); break
              case 'rotate180': image = image.rotate(180); break
              case 'flip': image = image.flip(); break
              case 'flop': image = image.flop(); break
              case 'normalice': image = image.normalise(); break
              case 'negate': image = image.negate(); break
              case 'tint': image = image.tint({ r: 255, g: 100, b: 100 }); break
            }
          }
        }        
        return await image.webp().toBuffer()
      }      
      if (/image/.test(mime) || /webp/.test(mime)) {
        let buffer = await quoted.download()
        const isWebpAnimated = /webp/.test(mime) && buffer.toString('hex', 0, 4) === '52494646' && effects.length === 0
        if (isWebpAnimated) {
        const media = { mimetype: 'webp', data: buffer };
        const metadata = { packname: pack, author: author, categories: [''] };
        const stickerPath = await writeExif(media, metadata);
        await client.sendMessage(m.chat, { sticker: { url: stickerPath }}, { quoted: m });
        await fs.unlinkSync(stickerPath)
        } else {
          const processedBuffer = await processImage(buffer, false)
          const tmpFile = `./lib/system/tmp/${Date.now()}.webp`
          await fs.writeFileSync(tmpFile, processedBuffer)
          await client.sendImageAsSticker(m.chat, tmpFile, m, { packname: pack, author: author })
          await fs.unlinkSync(tmpFile)
        }        
      } else if (/video/.test(mime)) {
        if ((quoted.msg || quoted).seconds > 20) return m.reply('❖ El video no puede ser muy largo')
        let buffer = await quoted.download()
        const tmpFile = `./lib/system/tmp/video-${Date.now()}.mp4`
        await fs.writeFileSync(tmpFile, buffer)
        await client.sendVideoAsSticker(m.chat, tmpFile, m, { packname: pack, author: author })
        await fs.unlinkSync(tmpFile)        
      } else if (urlArg) {
        const url = urlArg    
        if (!url.match(/\.(jpe?g|png|gif|webp|mp4|mov|avi|mkv|webm)$/i)) {
        return client.reply(m.chat, '❖ La URL debe ser de una imagen (jpg, png, gif, webp) o video (mp4, mov, avi, mkv, webm)', m)
        }        
        const response = await fetch(url)
        const buffer = Buffer.from(await response.arrayBuffer())
        if (url.match(/\.(jpe?g|png|gif|webp)$/i)) {
        const isWebpAnimated = url.match(/\.webp$/i) && buffer.toString('hex', 0, 4) === '52494646' && effects.length === 0        
        if (isWebpAnimated) {
          const media = { mimetype: 'webp', data: buffer };
          const metadata = { packname: pack, author: author, categories: [''] };
          const stickerPath = await writeExif(media, metadata);
          await client.sendMessage(m.chat, { sticker: { url: stickerPath }}, { quoted: m });
          await fs.unlinkSync(stickerPath)
        } else {
          const processedBuffer = await processImage(buffer, false)
          const tmpFile = `./lib/system/tmp/url-${Date.now()}.webp`
          await fs.writeFileSync(tmpFile, processedBuffer)
          await client.sendImageAsSticker(m.chat, tmpFile, m, { packname: pack, author: author })
          await fs.unlinkSync(tmpFile)
          }
        } else if (url.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
          const tmpFile = `./lib/system/tmp/video-url-${Date.now()}.mp4`
          await fs.writeFileSync(tmpFile, buffer)
          await client.sendVideoAsSticker(m.chat, tmpFile, m, { packname: pack, author: author })
          await fs.unlinkSync(tmpFile)
        }      
      } else {
        return client.reply(m.chat, `❀ Por favor, envía una imagen, video, sticker.\n> Usa *${prefix + command} -list* para ver formas y efectos`, m)
      }
    } catch (e) {
      return m.reply(msgglobal)
    }
  }
}

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png|webp|mp4|mov|avi|mkv|webm)/, 'gi'))
}