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
  <img src="https://img.shields.io/badge/WhatsApp-Bot-25D366?style=flat-square&logo=whatsapp&logoColor=white">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white">
  <img src="https://img.shields.io/badge/Baileys-Compatible-6f42c1?style=flat-square">
  <img src="https://img.shields.io/badge/Open%20Source-Yes-9b33b0?style=flat-square">
</p>

---

> [!NOTE]
> Este proyecto está en constante evolución. AlyaBot-MD recibe nuevas funciones, mejoras y correcciones de forma continua.
>
> Para conocer las novedades, actualizaciones y anuncios del proyecto:
>
> **[Canal oficial](https://web.stellarwa.xyz/channel)**

---

## Contenido

<details>
<summary><strong>Abrir menú</strong></summary>

<br>

- [Descripción](#descripción)
- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Cloud / VPS](#cloud--vps)
- [Termux](#instalación-en-termux)
- [Información importante](#información-importante-sobre-baileys)
- [Mantener el bot activo](#mantener-el-bot-activo)
- [Comandos PM2](#comandos-de-pm2)
- [Si el bot se detiene](#si-el-bot-se-detiene)
- [Nueva sesión](#obtener-una-nueva-sesión)
- [Patrocinadores](#patrocinadores)
- [Colaboradores](#colaboradores)
- [Equipo del proyecto](#equipo-del-proyecto)
- [Agradecimientos](#agradecimientos)
- [Comunidad](#comunidad)

<br>

</details>

---

## Descripción

AlyaBot-MD es un bot multifuncional para WhatsApp desarrollado utilizando Baileys.

El proyecto reúne diferentes sistemas de entretenimiento, economía, administración y automatización en un solo bot.

Su estructura permite modificar, personalizar y añadir nuevas funciones al proyecto.

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
| Personalización | Posibilidad de modificar y ampliar el proyecto. |
| Código abierto | Proyecto disponible para la comunidad. |

---

## Requisitos

Antes de instalar AlyaBot-MD asegúrate de tener:

- Node.js 18 o superior
- Git
- Yarn o npm
- FFmpeg
- ImageMagick
- Conexión estable a Internet

Para Termux se recomienda utilizar una versión actualizada.

---

# Instalación

<details>
<summary><strong>Abrir opciones de instalación</strong></summary>

<br>

- [Cloud / VPS](#cloud--vps)
- [Termux](#instalación-en-termux)

<br>

</details>

---

## Cloud / VPS

<details>
<summary><strong>Ver instalación para Cloud / VPS</strong></summary>

<br>

### Clonar el repositorio

```bash
git clone https://github.com/DevZyxlJs/AlyaBot-MD
```

### Entrar al proyecto

```bash
cd AlyaBot-MD
```

### Instalar dependencias

```bash
yarn install
```

También puedes utilizar:

```bash
npm install
```

### Iniciar el bot

```bash
npm start
```

> [!TIP]
> Si utilizas un VPS, se recomienda mantener Node.js y las dependencias del proyecto actualizadas.

<br>

</details>

---

## Instalación en Termux

<details>
<summary><strong>Ver instalación completa para Termux</strong></summary>

<br>

### 1. Dar permisos de almacenamiento

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

### 4. Clonar AlyaBot-MD

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

## Información importante sobre Baileys

> [!WARNING]
> No utilices forks, mods o versiones alteradas de Baileys.
>
> Evita especialmente:
>
> - Baileys modificados
> - Forks desconocidos
> - Versiones no oficiales
> - Librerías de fuentes poco confiables
>
> Utiliza siempre una versión legítima y compatible de Baileys.

> [!CAUTION]
> No reemplaces las dependencias del proyecto por versiones modificadas sin comprobar previamente su compatibilidad.

---

## Mantener el bot activo

<details>
<summary><strong>Abrir configuración de PM2</strong></summary>

<br>

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

> [!TIP]
> PM2 permite administrar el proceso del bot sin tener que iniciar manualmente el proyecto cada vez.

<br>

</details>

---

## Comandos de PM2

<details>
<summary><strong>Abrir comandos disponibles</strong></summary>

<br>

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

### Ver procesos activos

```bash
pm2 list
```

<br>

</details>

---

## Si el bot se detiene

> [!NOTE]
> Si el bot deja de ejecutarse después de perder conexión a Internet, cerrar Termux o reiniciar el dispositivo, vuelve a entrar en la carpeta del proyecto.

```bash
cd && cd AlyaBot-MD
```

Después inicia nuevamente:

```bash
npm start
```

> [!TIP]
> Si tienes el bot configurado con PM2, también puedes intentar iniciar nuevamente el proceso:

```bash
pm2 start index
```

---

## Obtener una nueva sesión

<details>
<summary><strong>Abrir instrucciones de sesión</strong></summary>

<br>

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
> Eliminar `Sessions/Owner` hará que tengas que realizar nuevamente el proceso de inicio de sesión del propietario.

<br>

</details>

---

# Patrocinadores

## Stellar

<details>
<summary><strong>Abrir información de Stellar</strong></summary>

<br>

<div align="center">

<a href="https://api.stellarwa.xyz">
  <img src="https://api.stellarwa.xyz/favicon.ico" alt="Stellar API" height="125">
</a>

<br><br>

<strong>API y servicios utilizados por AlyaBot-MD</strong>

</div>

### Enlaces

| Servicio | Enlace |
| :-- | :-- |
| Dashboard | [Abrir](https://api.stellarwa.xyz) |
| Shop | [Abrir](https://api.stellarwa.xyz/store) |
| Ticket | [Visitar](https://api.stellarwa.xyz/ticket) |
| Estado de servicios | [Ver estado](https://api.stellarwa.xyz/stats) |
| Canal | [Abrir canal](https://web.stellarwa.xyz/channel/api) |

<br>

</details>

---

## Cafirexos

<details>
<summary><strong>Abrir información de Cafirexos</strong></summary>

<br>

<div align="center">

<a href="https://cafirexos.com">
  <img src="https://cdn.cafirexos.com/logos/logo_cfros_2000x2000.png" alt="Cafirexos" height="125">
</a>

<br><br>

<strong>Hosting y servicios utilizados por el proyecto</strong>

</div>

### Enlaces

| Servicio | Enlace |
| :-- | :-- |
| Sitio web | [Visitar](https://cafirexos.com) |
| Área de clientes | [Abrir](https://cafirexos.com/clientarea.php) |
| Panel | [Abrir](https://panel.cafirexos.com) |
| Estado de servicios | [Ver estado](https://estado.cafirexos.com) |
| Canal de WhatsApp | [Ver canal](https://links.cafirexos.com/whatsapp/canal) |
| Soporte | [Contactar](https://cafirexos.com/contactenos) |

<br>

</details>

---

# Colaboradores

<details>
<summary><strong>Ver colaboradores del proyecto</strong></summary>

<br>

<div align="center">

<a href="https://stellarwa.xyz/about">
  <img src="https://contrib.rocks/image?repo=DevZyxlJs/AlyaBot-MD" alt="Colaboradores">
</a>

<br><br>

<strong>Gracias a todas las personas que han contribuido al desarrollo y mejora de AlyaBot-MD.</strong>

</div>

<br>

</details>

---

# Equipo del proyecto

<details>
<summary><strong>Ver equipo</strong></summary>

<br>

<div align="center">

<a href="https://stellarwa.xyz/about">
  <img src="https://github.com/DevZyxlJs.png?size=120" width="120" alt="ZyxlJs">
</a>

<br>

<strong>ZyxlJs</strong>

<br>

<sub>Propietario y desarrollador principal</sub>

</div>

<br>

</details>

---

# Agradecimientos

<details>
<summary><strong>Ver agradecimientos</strong></summary>

<br>

<div align="center">

<a href="https://stellarwa.xyz/about">
  <img src="https://github.com/AzamiJs.png?size=120" width="120" alt="Zam">
</a>

<br>

<strong>Zam</strong>

<br>

<sub>Colaborador y parte importante del proyecto</sub>

</div>

<br>

<p align="center">
  Gracias a todas las personas que han apoyado, probado, compartido y contribuido al proyecto.
</p>

</details>

---

# Comunidad

<details>
<summary><strong>Abrir enlaces de la comunidad</strong></summary>

<br>

<div align="center">

<a href="https://web.stellarwa.xyz/channel">
  <img src="https://img.shields.io/badge/CANAL%20OFICIAL-9b33b0?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Canal Oficial">
</a>

<br><br>

<p>
Únete al canal oficial para conocer novedades, actualizaciones y anuncios de AlyaBot-MD.
</p>

</div>

<br>

</details>

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