# 🚀 Guía de Despliegue en Vercel

## 📋 Pre-requisitos

- Cuenta en Vercel (https://vercel.com)
- Proyecto en GitHub/GitLab/Bitbucket (opcional pero recomendado)
- Variables de entorno de Supabase

## 🔧 Paso 1: Preparar el Proyecto

Ya hemos creado los archivos necesarios:
- ✅ `vercel.json` - Configuración de Vercel
- ✅ `.vercelignore` - Archivos a ignorar
- ✅ `api/index.js` - Entry point serverless
- ✅ `.env.example` - Plantilla de variables

## 📤 Paso 2: Subir a GitHub (Recomendado)

```bash
# Si aún no has inicializado git
git init
git add .
git commit -m "Preparar backend para Vercel"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin master
```

## 🌐 Paso 3: Desplegar en Vercel

### Opción A: Desde GitHub (Recomendado)

1. Ve a https://vercel.com/new
2. Conecta tu cuenta de GitHub
3. Selecciona tu repositorio
4. Configura el proyecto:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (dejar vacío)
   - **Output Directory**: (dejar vacío)

### Opción B: Con Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Login en Vercel
vercel login

# Desplegar
vercel

# Para producción
vercel --prod
```

## 🔐 Paso 4: Configurar Variables de Entorno

En el dashboard de Vercel:

1. Ve a tu proyecto
2. Settings > Environment Variables
3. Agrega estas variables:

```
NODE_ENV=production
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
FRONTEND_URL=https://tu-frontend.vercel.app
JWT_SECRET=genera_un_secreto_seguro_aqui
```

**🔑 Para obtener las credenciales de Supabase:**
- Ve a tu proyecto en Supabase
- Settings > API
- Copia: URL, anon key, service_role key

## 🧪 Paso 5: Probar el Despliegue

Una vez desplegado, prueba estos endpoints:

```bash
# Health check
https://tu-backend.vercel.app/health

# Status API
https://tu-backend.vercel.app/api/status

# Crear KPI (POST)
https://tu-backend.vercel.app/api/kpis

# Obtener KPIs
https://tu-backend.vercel.app/api/kpis/area/Inventario
```

## 🔄 Paso 6: Actualizar Frontend

Actualiza la URL del backend en tu frontend:

```javascript
// En tus componentes React
const BACKEND_URL = 'https://tu-backend.vercel.app';
```

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
# Asegúrate de que todas las dependencias estén en package.json
npm install
```

### Error: "Cannot find module"
- Verifica que todos los imports usen `.js` al final
- Ejemplo: `import x from './file.js'`

### Error: CORS
- Verifica que FRONTEND_URL esté en las variables de entorno
- Revisa corsOptions en server.js

### Logs en Vercel
1. Ve a tu proyecto en Vercel
2. Deployments > Click en el deployment
3. View Function Logs

## 📊 Paso 7: Ejecutar SQL en Supabase

No olvides ejecutar el script de creación de tablas:

1. Ve a Supabase Dashboard
2. SQL Editor
3. Copia y ejecuta: `database/kpi_registros.sql`

## ✅ Verificación Final

- [ ] Backend desplegado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Health check responde OK
- [ ] Tabla kpi_registros creada en Supabase
- [ ] Frontend actualizado con nueva URL
- [ ] Prueba de POST/GET funciona

## 🔗 URLs Útiles

- Dashboard Vercel: https://vercel.com/dashboard
- Logs: https://vercel.com/tu-usuario/tu-proyecto/deployments
- Domains: https://vercel.com/tu-usuario/tu-proyecto/settings/domains

## 📝 Notas Importantes

1. **Dominio personalizado**: En Settings > Domains puedes agregar tu dominio
2. **Auto-deploy**: Cada push a master desplegará automáticamente
3. **Rollback**: Puedes volver a versiones anteriores desde Deployments
4. **Logs**: Revisa los logs para debugging en tiempo real

## 🎉 ¡Listo!

Tu backend está desplegado en Vercel con:
- ✅ Serverless functions
- ✅ Auto-scaling
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Integración continua
