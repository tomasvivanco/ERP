# ERP Constructora Chile 🏗️

Sistema de gestión ERP para constructoras medianas en Chile.

## Módulos
- 📊 Dashboard con KPIs en tiempo real
- 🏗️ Gestión de Proyectos y Obras
- 📋 Presupuestos APU (Análisis de Precios Unitarios) — precios MINVU RM 2025
- 💸 Flujo de Caja por proyecto y resumen empresa
- 🏢 Gastos Generales
- 🛒 Compras y Órdenes de Compra
- 📦 Bodega y Control de Stock
- 👷 RRHH — Liquidaciones con normativa vigente 2025
- 🤝 Subcontratos + Directorio + Estados de Pago
- 🧾 Facturación DTE/SII (ChileSystems SimpleAPI)
- 🏦 Conciliación Bancaria (3 cuentas)
- 📈 Reportes con exportación Excel y PDF
- ⚙️ Configuración

## Tecnología
- **Frontend:** HTML5 + JavaScript ES6 + Chart.js 4.4 + SheetJS
- **Backend:** InsForge (PostgreSQL en la nube)
- **DTE/SII:** ChileSystems SimpleAPI
- **Deploy:** Tu dominio o GitHub Pages

## Backend Setup
```bash
cd backend
node erp_insforge_setup.js ghp_TOKEN
```

## Tasas AFP vigentes (oct 2025)
Capital 1.44% · Cuprum 1.44% · Habitat 1.27% · Modelo 0.58% · Planvital 1.16% · ProVida 1.45% · Uno 0.46%

## Documentación
Ver carpeta `/docs` para especificación funcional y arquitectura técnica.

---
Desarrollado con Claude (Anthropic) + InsForge Backend
