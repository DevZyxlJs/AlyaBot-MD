# AlyaBot-MD

<p align="center">
  <img src="https://cloud.stellarwa.xyz/a5i2dp5V.jpeg" alt="AlyaBot-MD" width="160">
</p>

<h2 align="center">AlyaBot-MD</h2>

<p align="center">
  Bot multifuncional para WhatsApp basado en Baileys.
  <br>
  Gratuito, de código abierto y en constante desarrollo.
</p>

<p align="center">
  <a href="https://web.stellarwa.xyz/channel">
    <img src="https://img.shields.io/badge/Canal%20Oficial-9b33b0?style=for-the-badge&logo=whatsapp&logoColor=white">
  </a>
  <a href="https://github.com/DevZyxlJs/AlyaBot-MD">
    <img src="https://img.shields.io/github/stars/DevZyxlJs/AlyaBot-MD?style=for-the-badge&color=9b33b0">
  </a>
  <a href="https://github.com/DevZyxlJs/AlyaBot-MD">
    <img src="https://img.shields.io/github/forks/DevZyxlJs/AlyaBot-MD?style=for-the-badge&color=6f42c1">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WhatsApp-Bot-25D366?style=flat-square&logo=whatsapp&logoColor=white">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white">
  <img src="https://img.shields.io/badge/Baileys-Compatible-6f42c1?style=flat-square">
  <img src="https://img.shields.io/badge/Open%20Source-Yes-9b33b0?style=flat-square">
</p>

---

> [!NOTE]
> AlyaBot-MD se encuentra en constante desarrollo. Se añaden nuevas funciones, mejoras y correcciones con el tiempo.
>
> Para conocer las novedades del proyecto, visita nuestro canal oficial:
>
> **[Canal oficial](https://web.stellarwa.xyz/channel)**

---

## 📚 Contenido

<details>
<summary><strong>Abrir menú</strong></summary>

<br>

- [💠 Descripción](#-descripción)
- [⚙️ Características](#️-características)
- [📦 Requisitos](#-requisitos)
- [🚀 Instalación](#-instalación)
- [☁️ Cloud / VPS](#️-cloud--vps)
- [📱 Termux](#-instalación-en-termux)
- [⚠️ Información importante](#️-información-importante-sobre-baileys)
- [🔄 Mantener el bot activo](#-mantener-el-bot-activo)
- [🛠️ Comandos PM2](#️-comandos-de-pm2)
- [🔧 Solución de problemas](#-si-el-bot-se-detiene)
- [🔐 Nueva sesión](#-obtener-una-nueva-sesión)
- [💜 Patrocinadores](#-patrocinadores)
- [👥 Colaboradores](#-colaboradores)
- [👤 Equipo](#-equipo-del-proyecto)
- [🤝 Agradecimientos](#-agradecimientos)
- [🌐 Comunidad](#-comunidad)

<br>

</details>

---

## 💠 Descripción

AlyaBot-MD es un bot multifuncional para WhatsApp desarrollado con Baileys.

El proyecto reúne diferentes sistemas de entretenimiento, economía, administración y automatización en un mismo bot.

Su estructura permite personalizar el proyecto, modificar funciones y añadir nuevos sistemas según las necesidades de la comunidad.

---

## ⚙️ Características

| Sistema | Descripción |
| :-- | :-- |
| Gacha | Sistema de colección de personajes y funciones relacionadas. |
| Juegos | Diferentes comandos de entretenimiento. |
| Economía | Sistema económico para usuarios y grupos. |
| Respuestas automáticas | Respuestas y acciones automáticas. |
| Administración | Herramientas para la gestión de grupos. |
| APIs externas | Integración con servicios externos. |
| Personalización | Código preparado para añadir nuevas funciones. |
| Código abierto | Proyecto disponible para la comunidad. |

---

## 📦 Requisitos

Antes de instalar AlyaBot-MD asegúrate de contar con:

- Node.js 18 o superior
- Git
- Yarn o npm
- FFmpeg
- ImageMagick
- Conexión estable a Internet

> [!TIP]
> Si utilizas Termux, procura mantener sus paquetes actualizados antes de comenzar la instalación.

---

## 🚀 Instalación

<details>
<summary><strong>Ver opciones de instalación</strong></summary>

<br>

| Plataforma | Guía |
| :-- | :-- |
| ☁️ Cloud / VPS | [Ver instalación](#️-cloud--vps) |
| 📱 Termux | [Ver instalación](#-instalación-en-termux) |

<br>

</details>

---

## ☁️ Cloud / VPS

<details>
<summary><strong>Ver instalación para Cloud / VPS</strong></summary>

<br>

### 1. Clonar el repositorio

```bash
git clone https://github.com/DevZyxlJs/AlyaBot-MD
```

### 2. Entrar al proyecto

```bash
cd AlyaBot-MD
```

### 3. Instalar dependencias

```bash
yarn install
```

También puedes utilizar:

```bash
npm install
```

### 4. Iniciar el bot

```bash
npm start
```

> [!TIP]
> En un VPS puedes utilizar PM2 para mantener el proceso ejecutándose durante más tiempo.

<br>

</details>

---

## 📱 Instalación en Termux

<details>
<summary><strong>Ver instalación completa</strong></summary>

<br>

### 1. Permisos de almacenamiento

```bash
termux-setup-storage
```

### 2. Actualizar Termux

```bash
apt update && apt upgrade
```

### 3. Instalar dependencias

```bash
pkg install -y git nodejs ffmpeg imagemagick yarn
```

### 4. Clonar el proyecto

```bash
git clone https://github.com/DevZyxlJs/AlyaBot-MD
```

### 5. Entrar en la carpeta

```bash
cd AlyaBot-MD
```

### 6. Instalar dependencias

```bash
yarn install
```

También puedes utilizar:

```bash
npm install
```

### 7. Iniciar el bot

```bash
npm start
```

> [!TIP]
> Durante la instalación puede aparecer:
>
> ```text
> (Y/I/N/O/D/Z) [default=N] ?
> ```
>
> Escribe `y` y presiona `ENTER` para continuar.

> [!IMPORTANT]
> No cierres Termux mientras se estén instalando las dependencias. El tiempo de instalación puede variar dependiendo del dispositivo y de la conexión.

<br>

</details>

---

## ⚠️ Información importante sobre Baileys

> [!WARNING]
> Evita utilizar forks, mods o versiones alteradas de Baileys.
>
> No utilices:
>
> - Baileys modificados
> - Forks desconocidos
> - Versiones no oficiales
> - Librerías obtenidas de fuentes poco confiables
>
> Utiliza una versión legítima y compatible con el proyecto.

> [!CAUTION]
> No reemplaces las dependencias originales por versiones modificadas sin comprobar previamente su compatibilidad.

---

## 🔄 Mantener el bot activo

<details>
<summary><strong>Abrir configuración de PM2</strong></summary>

<br>

Para mantener AlyaBot-MD ejecutándose durante más tiempo en Termux puedes utilizar PM2.

Ejecuta los siguientes comandos dentro de la carpeta del proyecto:

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

> [!TIP]
> PM2 permite administrar el proceso del bot sin tener que ejecutar manualmente `npm start` cada vez.

<br>

</details>

---

## 🛠️ Comandos de PM2

<details>
<summary><strong>Abrir comandos disponibles</strong></summary>

<br>

### Eliminar el proceso

```bash
pm2 delete index
```

### Ver registros

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

### Ver procesos activos

```bash
pm2 list
```

<br>

</details>

---

## 🔧 Si el bot se detiene

> [!NOTE]
> Si el bot deja de ejecutarse después de perder conexión, cerrar Termux o reiniciar el dispositivo, vuelve a entrar en la carpeta del proyecto.

```bash
cd && cd AlyaBot-MD
```

Después inicia nuevamente:

```bash
npm start
```

Si utilizas PM2:

```bash
pm2 start index
```

---

## 🔐 Obtener una nueva sesión

<details>
<summary><strong>Abrir instrucciones</strong></summary>

<br>

Primero detén el bot:

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

y presiona `ENTER` hasta volver a la terminal del proyecto.

Después elimina la sesión anterior:

```bash
cd && cd AlyaBot-MD && rm -rf Sessions/Owner
```

Finalmente inicia nuevamente:

```bash
npm start
```

> [!WARNING]
> Al eliminar `Sessions/Owner` tendrás que realizar nuevamente el proceso de inicio de sesión del propietario.

<br>

</details>

---

# 💜 Patrocinadores

## Stellar

<details>
<summary><strong>Ver servicios de Stellar</strong></summary>

<br>

<div align="center">

<a href="https://api.stellarwa.xyz">
  <img src="https://api.stellarwa.xyz/favicon.ico" alt="Stellar API" height="100">
</a>

<br><br>

<strong>API y servicios utilizados por AlyaBot-MD</strong>

</div>

<br>

| Servicio | Enlace |
| :-- | :-- |
| Dashboard | [Abrir](https://api.stellarwa.xyz) |
| Shop | [Abrir](https://api.stellarwa.xyz/store) |
| Ticket | [Visitar](https://api.stellarwa.xyz/ticket) |
| Estado | [Ver estado](https://api.stellarwa.xyz/stats) |
| Canal | [Abrir canal](https://web.stellarwa.xyz/channel/api) |

<br>

</details>

---

## Cafirexos

<details>
<summary><strong>Ver servicios de Cafirexos</strong></summary>

<br>

<div align="center">

<a href="https://cafirexos.com">
  <img src="https://cdn.cafirexos.com/logos/logo_cfros_2000x2000.png" alt="Cafirexos" height="100">
</a>

<br><br>

<strong>Hosting y servicios utilizados por el proyecto</strong>

</div>

<br>

| Servicio | Enlace |
| :-- | :-- |
| Sitio web | [Visitar](https://cafirexos.com) |
| Área de clientes | [Abrir](https://cafirexos.com/clientarea.php) |
| Panel | [Abrir](https://panel.cafirexos.com) |
| Estado | [Ver estado](https://estado.cafirexos.com) |
| Canal | [Ver canal](https://links.cafirexos.com/whatsapp/canal) |
| Soporte | [Contactar](https://cafirexos.com/contactenos) |

<br>

</details>

---

# 👥 Colaboradores

<details>
<summary><strong>Ver colaboradores</strong></summary>

<br>

<div align="center">

<a href="https://stellarwa.xyz/about">
  <img src="https://contrib.rocks/image?repo=DevZyxlJs/AlyaBot-MD" alt="Colaboradores">
</a>

<br><br>

<sub>
Cada aporte, corrección y mejora ayuda a que AlyaBot-MD siga creciendo.
</sub>

</div>

<br>

</details>

---

# 👤 Equipo del proyecto

<details>
<summary><strong>Ver equipo</strong></summary>

<br>

<div align="center">

<a href="https://stellarwa.xyz/about">
  <img src="https://github.com/DevZyxlJs.png?size=160" width="120" alt="ZyxlJs">
</a>

<br><br>

<strong>ZyxlJs</strong>

<br>

<sub>Propietario · Desarrollador principal</sub>

<br><br>

<a href="https://github.com/DevZyxlJs">
  <img src="https://img.shields.io/badge/GitHub-DevZyxlJs-181717?style=flat-square&logo=github">
</a>

</div>

<br>

</details>

---

# 🤝 Agradecimientos

<details>
<summary><strong>Ver agradecimientos</strong></summary>

<br>

<div align="center">

<a href="https://stellarwa.xyz/about">
  <img src="https://github.com/AzamiJs.png?size=160" width="120" alt="Zam">
</a>

<br><br>

<strong>Zam</strong>

<br>

<sub>Colaborador del proyecto</sub>

</div>

<br>

<p align="center">
  Gracias a todas las personas que han probado, apoyado, compartido y contribuido al proyecto.
</p>

<br>

</details>

---

# 🌐 Comunidad

<details>
<summary><strong>Ver enlaces de la comunidad</strong></summary>

<br>

<div align="center">

<a href="https://web.stellarwa.xyz/channel">
  <img src="https://img.shields.io/badge/CANAL%20OFICIAL-9b33b0?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Canal Oficial">
</a>

<br><br>

<sub>
Novedades, actualizaciones y anuncios de AlyaBot-MD.
</sub>

</div>

<br>

</details>

---

<div align="center">

### AlyaBot-MD

Bot multifuncional para WhatsApp.

<br>

<sub>
Desarrollado y mantenido por el equipo de AlyaBot-MD.
</sub>

<br><br>

<a href="https://github.com/DevZyxlJs/AlyaBot-MD">
  <img src="https://img.shields.io/github/stars/DevZyxlJs/AlyaBot-MD?style=for-the-badge&label=Stars&color=9b33b0" alt="GitHub Stars">
</a>

<a href="https://github.com/DevZyxlJs/AlyaBot-MD">
  <img src="https://img.shields.io/github/forks/DevZyxlJs/AlyaBot-MD?style=for-the-badge&label=Forks&color=6f42c1" alt="GitHub Forks">
</a>

<br><br>

<sub>© AlyaBot-MD · Todos los derechos reservados.</sub>

</div>