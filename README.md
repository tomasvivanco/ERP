# ERP Constructora Chile 🏗️

Sistema de gestión ERP para constructoras pequeñas y medianas en Chile. **Versión actual de la interfaz: v2** (`ERP_Constructora_v2.html`, entrada `index.html`).

## Módulos (v2)
- 📊 Dashboard con KPIs
- 👥 Usuarios — registro nombre/correo y **RBAC** (Dirección, Gerencia, Jefatura)
- 📐 **Presupuesto de obra** — WBS / partidas, APU (línea MINVU), RRHH, subcontratos, arriendos, GG, caja chica, **flujo de aprobación** (Jefatura → Gerencia → Dirección)
- 📋 **Presupuesto cliente** — oferta comercial sobre el presupuesto de obra (acceso restringido; exportación Excel / PDF)
- 🏗️ Proyectos y obras
- 💸 Flujo de caja
- 🏢 Gastos generales
- 🛒 Compras y OC
- 📦 Bodega
- 👷 RRHH
- 🤝 Subcontratos
- 🧾 Facturación DTE/SII
- 🏦 Banco
- 📈 Reportes
- ⚙️ Configuración

La demo en HTML usa datos locales en el navegador; en producción los datos deben vivir en **InsForge** con autenticación y **RLS** (filas por usuario/rol/proyecto). No suba `.env` ni claves al repositorio.

## Tecnología
- **Frontend:** HTML5 + JavaScript ES6 + Chart.js 4.4 + SheetJS
- **Backend:** InsForge (PostgreSQL en la nube)
- **DTE/SII:** ChileSystems SimpleAPI
- **Deploy:** GitHub Pages (repositorio **privado** recomendado: el código no sustituye el control de acceso; la página pública solo debe servir el shell; datos sensibles en backend con políticas RLS)

## Backend Setup
```bash
cp .env.example .env
# Editar .env con INSFORGE_BASE_URL e INSFORGE_API_KEY (nunca commitear .env)
node erp_insforge_setup.js
```

## GitHub privado y Pages
En GitHub: **Settings → General → Danger zone** o visibilidad del repo → **Private**. Para Pages con repo privado se requiere plan que lo permita, o despliegue en otro host con acceso restringido. Los datos de usuarios y documentos deben almacenarse solo en el backend con permisos explícitos.

## Tasas AFP vigentes (oct 2025)
Capital 1.44% · Cuprum 1.44% · Habitat 1.27% · Modelo 0.58% · Planvital 1.16% · ProVida 1.45% · Uno 0.46%

## Documentación
Ver carpeta `/docs` para especificación funcional y arquitectura técnica.

---
Desarrollado con Claude (Anthropic) + InsForge Backend
