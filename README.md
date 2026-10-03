# AlyaBot-MD

<p align="center">
  <img src="https://cloud.stellarwa.xyz/a5i2dp5V.jpeg" alt="AlyaBot-MD" width="180">
</p>

<h1 align="center">AlyaBot-MD</h1>

<p align="center">
  Bot multifuncional para WhatsApp basado en Baileys.
  <br>
  Gratuito, de código abierto y en constante desarrollo.
</p>

<p align="center">
  <a href="https://web.stellarwa.xyz/channel">
    <img src="https://img.shields.io/badge/Canal%20Oficial-9b33b0?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Canal Oficial">
  </a>
  <a href="https://github.com/DevZyxlJs/AlyaBot-MD">
    <img src="https://img.shields.io/github/stars/DevZyxlJs/AlyaBot-MD?style=for-the-badge&color=9b33b0" alt="Stars">
  </a>
  <a href="https://github.com/DevZyxlJs/AlyaBot-MD">
    <img src="https://img.shields.io/github/forks/DevZyxlJs/AlyaBot-MD?style=for-the-badge&color=6f42c1" alt="Forks">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WhatsApp-Bot-25D366?style=flat-square&logo=whatsapp&logoColor=white" alt="WhatsApp">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Baileys-Compatible-6f42c1?style=flat-square" alt="Baileys">
  <img src="https://img.shields.io/badge/Open%20Source-Yes-9b33b0?style=flat-square" alt="Open Source">
</p>

---

> [!NOTE]
> Este proyecto está en constante evolución. Trabajamos continuamente para mejorar AlyaBot-MD, añadir nuevas funciones y ofrecer una mejor experiencia a la comunidad.
>
> Para recibir novedades, actualizaciones y anuncios del proyecto:
>
> **[Canal oficial](https://web.stellarwa.xyz/channel)**

---

## Descripción

AlyaBot-MD es un bot multifuncional para WhatsApp desarrollado utilizando Baileys.

El proyecto reúne diferentes sistemas de entretenimiento, economía, administración y automatización en un solo bot. Su código está pensado para poder ser modificado y ampliado fácilmente.

---

## Características

| Sistema | Descripción |
| :-- | :-- |
| Gacha | Sistema de colección de personajes y diferentes funciones relacionadas. |
| Juegos | Comandos de entretenimiento para interactuar con el bot. |
| Economía | Sistema económico para usuarios y grupos. |
| Respuestas automáticas | Diferentes respuestas y acciones automáticas. |
| Administración | Herramientas para la gestión de grupos. |
| APIs externas | Integración con diferentes servicios y APIs. |
| Personalización | Código preparado para añadir y modificar funciones. |
| Código abierto | Proyecto disponible para la comunidad. |

---

## Requisitos

Antes de instalar el proyecto asegúrate de contar con:

- Node.js 18 o superior
- Git
- Yarn o npm
- FFmpeg
- ImageMagick
- Conexión estable a Internet

Para Termux también necesitarás una instalación actualizada y permisos de almacenamiento.

---

# Instalación

## Cloud / VPS

Clona el repositorio:

```bash
git clone https://github.com/DevZyxlJs/AlyaBot-MD
```

Entra al directorio:

```bash
cd AlyaBot-MD
```

Instala las dependencias:

```bash
yarn install
```

También puedes utilizar npm:

```bash
npm install
```

Inicia el bot:

```bash
npm start
```

---

# Instalación en Termux

Concede permisos de almacenamiento:

```bash
termux-setup-storage
```

Actualiza los paquetes:

```bash
apt update && apt upgrade
```

Instala las dependencias:

```bash
pkg install -y git nodejs ffmpeg imagemagick yarn
```

Clona el repositorio:

```bash
git clone https://github.com/DevZyxlJs/AlyaBot-MD
```

Entra en la carpeta:

```bash
cd AlyaBot-MD
```

Instala las dependencias:

```bash
yarn install
```

También puedes utilizar:

```bash
npm install
```

Inicia AlyaBot-MD:

```bash
npm start
```

Si Termux muestra:

```text
(Y/I/N/O/D/Z) [default=N] ?
```

Escribe:

```text
y
```

y presiona ENTER para continuar.

---

# Información importante sobre Baileys

No utilices forks, mods o versiones alteradas de Baileys.

Evita especialmente:

- Baileys modificados
- Forks desconocidos
- Versiones no oficiales
- Librerías de fuentes poco confiables

Utiliza siempre una versión legítima y compatible de Baileys para evitar problemas de estabilidad y compatibilidad.

---

# Mantener el bot activo

Para mantener AlyaBot-MD ejecutándose durante más tiempo en Termux puedes utilizar PM2.

Ejecuta estos comandos dentro de la carpeta del proyecto:

```bash
termux-wake-lock
```

```bash
npm i -g pm2
```

```bash
pm2 start index.js
```

```bash
pm2 save
```

```bash
pm2 logs
```

---

## Comandos de PM2

### Eliminar el proceso

```bash
pm2 delete index
```

### Ver los registros

```bash
pm2 logs
```

### Detener el bot

```bash
pm2 stop index
```

### Iniciar nuevamente

```bash
pm2 start index
```

---

# Si el bot se detiene

Si el bot deja de ejecutarse después de perder conexión a Internet, cerrar Termux o reiniciar el dispositivo, vuelve a entrar en la carpeta del proyecto:

```bash
cd && cd AlyaBot-MD
```

Después inicia nuevamente:

```bash
npm start
```

---

# Obtener una nueva sesión

Si necesitas generar una nueva sesión del propietario, primero detén el bot.

Presiona:

```text
Ctrl + C
```

Si Termux muestra:

```text
(Y/I/N/O/D/Z) [default=N] ?
```

escribe:

```text
z
```

y presiona ENTER hasta volver a la terminal del proyecto.

Después elimina la sesión anterior:

```bash
cd && cd AlyaBot-MD && rm -rf Sessions/Owner
```

Finalmente inicia el bot:

```bash
npm start
```

---

# Patrocinadores

## Stellar

<div align="center">

<a href="https://api.stellarwa.xyz">
  <img src="https://api.stellarwa.xyz/favicon.ico" alt="Stellar API" height="125">
</a>

<br><br>

<strong>API y servicios utilizados por el proyecto</strong>

</div>

### Enlaces

| Servicio | Enlace |
| :-- | :-- |
| Dashboard | [Abrir](https://api.stellarwa.xyz) |
| Shop | [Abrir](https://api.stellarwa.xyz/store) |
| Ticket | [Visitar](https://api.stellarwa.xyz/ticket) |
| Estado de servicios | [Ver](https://api.stellarwa.xyz/stats) |
| Canal | [Abrir](https://web.stellarwa.xyz/channel/api) |

---

## Cafirexos

<div align="center">

<a href="https://cafirexos.com">
  <img src="https://cdn.cafirexos.com/logos/logo_cfros_2000x2000.png" alt="Cafirexos" height="125">
</a>

<br><br>

<strong>Hosting y servicios para el proyecto</strong>

</div>

### Enlaces

| Servicio | Enlace |
| :-- | :-- |
| Sitio web | [Visitar](https://cafirexos.com) |
| Área de clientes | [Abrir](https://cafirexos.com/clientarea.php) |
| Panel | [Abrir](https://panel.cafirexos.com) |
| Estado de servicios | [Ver](https://estado.cafirexos.com) |
| Canal de WhatsApp | [Ver canal](https://links.cafirexos.com/whatsapp/canal) |
| Soporte | [Contactar](https://cafirexos.com/contactenos) |

---

# Colaboradores

<div align="center">

<a href="https://stellarwa.xyz/about">
  <img src="https://contrib.rocks/image?repo=DevZyxlJs/AlyaBot-MD" alt="Colaboradores">
</a>

</div>

---

# Agradecimientos

<div align="center">

<a href="https://stellarwa.xyz/about">
  <img src="https://github.com/AzamiJs.png?size=120" width="120" alt="Zam">
</a>

<br><br>

<strong>Zam</strong>

</div>

---

# Propietario

<div align="center">

<a href="https://stellarwa.xyz/about">
  <img src="https://github.com/DevZyxlJs.png?size=120" width="120" alt="ZyxlJs">
</a>

<br><br>

<strong>ZyxlJs</strong>

</div>

---

# Comunidad

Para conocer las novedades, actualizaciones y anuncios de AlyaBot-MD, puedes unirte al canal oficial.

<p align="center">

<a href="https://web.stellarwa.xyz/channel">
  <img src="https://img.shields.io/badge/CANAL%20OFICIAL-9b33b0?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Canal Oficial">
</a>

</p>

---

<div align="center">

<strong>AlyaBot-MD</strong>

<br><br>

Proyecto desarrollado para la comunidad de WhatsApp.

<br><br>

<a href="https://github.com/DevZyxlJs/AlyaBot-MD">
  <img src="https://img.shields.io/github/stars/DevZyxlJs/AlyaBot-MD?style=for-the-badge&color=9b33b0" alt="GitHub Stars">
</a>

</div>