import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

const limpiarTmp = async () => {
  try {
    const dir = '/home/container/lib/system/tmp'

    if (fs.existsSync(dir)) {
      const archivos = await fs.promises.readdir(dir)
      for (const archivo of archivos) {
        const ruta = path.join(dir, archivo)
        try {
          const stats = await fs.promises.stat(ruta)
          if (stats.isFile()) {
            await fs.promises.unlink(ruta)
           // console.log(chalk.gray(`[ ✿ ] Archivo eliminado: ${ruta}`))
          } else if (stats.isDirectory()) {
            await fs.promises.rm(ruta, { recursive: true, force: true })
          //  console.log(chalk.gray(`[ ✿ ] Carpeta eliminada: ${ruta}`))
          }
        } catch (err) {
          console.log(chalk.red(`Error eliminando ${ruta}: ${err.message}`))
        }
      }
    }
  } catch (e) {
    console.log(chalk.red('Error limpiando tmp'))
  }
}

// cada 1 hora (3600000 ms)
setInterval(limpiarTmp, 3600000)
limpiarTmp()