import fs from "fs"
import path from "path"
import chalk from "chalk"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
global.comandos = new Map()
global.plugins = {}
const commandsFolder = path.join(__dirname, "../../cmds")

async function seeCommands(dir = commandsFolder) {
  const items = fs.readdirSync(dir)
  for (const fileOrFolder of items) {
    const fullPath = path.join(dir, fileOrFolder)   
    if (fs.lstatSync(fullPath).isDirectory()) {
      await seeCommands(fullPath)
      continue
    }   
    if (!fileOrFolder.endsWith(".ts")) continue
    try {
      const modulePath = `${path.resolve(fullPath)}?update=${Date.now()}`
      const imported = await import(modulePath)
      const comando = imported.default
      const pluginName = fileOrFolder.replace(".ts", "")
      global.plugins[pluginName] = imported
      if (!comando?.command || typeof comando.run !== "function") continue     
      comando.command.forEach(cmd => {
        global.comandos.set(cmd.toLowerCase(), {
          pluginName,
          run: comando.run,
          category: comando.category || "uncategorized",
          isOwner: comando.isOwner || false,
          isGroup: comando.isGroup || false,
          isAdmin: comando.isAdmin || false,
          botAdmin: comando.botAdmin || false,          
          before: imported.before || null,
          after: imported.after || null,
          info: comando.info || {}
        })
      })
    } catch (e) {
      console.error(chalk.red(`⚠ Error en el plugin ${fileOrFolder}:`), e)
    }
  }
}

const debounceMap = new Map()
global.reload = async (_ev, fullPath) => {
  if (!fullPath.endsWith(".ts")) return
  if (debounceMap.has(fullPath)) clearTimeout(debounceMap.get(fullPath))
  debounceMap.set(fullPath, setTimeout(async () => {
    debounceMap.delete(fullPath)
    const filename = path.basename(fullPath)
    if (!fs.existsSync(fullPath)) {
      console.log(chalk.yellow(`⚠ Plugin eliminado: ${filename}`))
      delete global.plugins[filename.replace(".ts", "")]
      return
    }  
    try {
      const modulePath = `${fullPath}?update=${Date.now()}`
      const imported = await import(modulePath)
      const pluginName = filename.replace(".ts", "")
      global.plugins[pluginName] = imported
      const comando = imported.default
      if (comando?.command && typeof comando.run === "function") {
        const cmds = Array.isArray(comando.command) ? comando.command : [comando.command]
        cmds.forEach(cmd => {
          if (cmd) global.comandos.set(cmd.toLowerCase(), {
            pluginName,
            run: comando.run,
            category: comando.category || "uncategorized",
            isOwner: comando.isOwner || false,
            isAdmin: comando.isAdmin || false,
            botAdmin: comando.botAdmin || false,
            isGroup: comando.isGroup || false,
            before: imported.before || null,
            after: imported.after || null,
            info: comando.info || {}
          })
        })
      }
      console.log(chalk.green(`✓ Plugin recargado: ${filename}`))
    } catch (e) {
      console.error(chalk.red(`⚠ Error al recargar ${filename}:\n`), e)
    }
  }, 300))
}

Object.freeze(global.reload)
const watchers = [];
function startWatcher() {
  for (const w of watchers) { try { w.close(); } catch {} }
  watchers.length = 0;
  function watchDir(dir) {
    try {
      const w = fs.watch(dir, (event, filename) => {
        if (filename && filename.endsWith('.ts')) global.reload(event, path.join(dir, filename));
      });
      watchers.push(w);
      for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        if (fs.lstatSync(full).isDirectory()) watchDir(full);
      }
    } catch {}
  }
  watchDir(commandsFolder);
}
startWatcher();

export default seeCommands
