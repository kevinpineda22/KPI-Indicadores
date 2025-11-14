# 📊 Sistema de KPIs - Instrucciones de Configuración

## 🗄️ Configuración de Base de Datos

### 1. Crear Tabla en Supabase

Sigue estos pasos para crear la tabla `kpi_registros` en tu base de datos Supabase:

#### Opción A: Desde el Editor SQL de Supabase (Recomendado)

1. **Accede a tu proyecto en Supabase**
   - Ve a [https://supabase.com](https://supabase.com)
   - Inicia sesión y selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral izquierdo, haz clic en **"SQL Editor"**
   - O usa el atajo: presiona `Cmd/Ctrl + K` y busca "SQL Editor"

3. **Crea una nueva query**
   - Haz clic en **"+ New query"**

4. **Ejecuta el script**
   - Copia todo el contenido del archivo `database/kpi_registros.sql`
   - Pégalo en el editor SQL
   - Haz clic en **"RUN"** o presiona `Cmd/Ctrl + Enter`

5. **Verifica la creación**
   - Ve a **"Table Editor"** en el menú lateral
   - Deberías ver la tabla `kpi_registros` con todas sus columnas

#### Opción B: Desde la Terminal con Supabase CLI

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Iniciar sesión
supabase login

# Ejecutar el script
supabase db push
```

---

## 🔌 Configuración del Backend

### 1. Variables de Entorno

Asegúrate de tener configuradas las variables de entorno en tu archivo `.env`:

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_KEY=tu_supabase_key
PORT=3000
```

### 2. Iniciar el Servidor

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar servidor en modo desarrollo
npm run dev

# O en modo producción
npm start
```

El servidor debería estar corriendo en `http://localhost:3000`

---

## 🌐 Endpoints de la API

Una vez que el servidor esté corriendo, tendrás acceso a estos endpoints:

### **Crear KPI**
```http
POST /api/kpis
Content-Type: application/json

{
  "area": "Inventario",
  "indicador": "Exactitud de inventario",
  "valor": 98.50,
  "unidad": "%",
  "cumple_meta": true,
  "meta": 98.00,
  "datos_entrada": {
    "unidadesCorrectas": 985,
    "unidadesTotales": 1000
  },
  "direccion": "Operaciones",
  "usuario": "admin@example.com"
}
```

### **Obtener KPIs por Área**
```http
GET /api/kpis/area/Inventario
```

### **Obtener Últimos Valores por Área**
```http
GET /api/kpis/area/Inventario/ultimos
```

### **Obtener Histórico de un KPI**
```http
GET /api/kpis/historico/Inventario/Exactitud%20de%20inventario?dias=30
```

### **Obtener Resumen con Estadísticas**
```http
GET /api/kpis/resumen?area=Inventario
```

### **Obtener Estadísticas de un Área**
```http
GET /api/kpis/estadisticas/Inventario?dias=30
```

---

## 🧪 Probar la API

### Con cURL:

```bash
# Crear un KPI de prueba
curl -X POST http://localhost:3000/api/kpis \
  -H "Content-Type: application/json" \
  -d '{
    "area": "Inventario",
    "indicador": "Exactitud de inventario",
    "valor": 98.50,
    "unidad": "%",
    "cumple_meta": true,
    "meta": 98.00,
    "datos_entrada": {
      "unidadesCorrectas": 985,
      "unidadesTotales": 1000
    },
    "direccion": "Operaciones",
    "usuario": "test@example.com"
  }'

# Obtener KPIs del área Inventario
curl http://localhost:3000/api/kpis/area/Inventario/ultimos
```

### Con Postman:

1. Importa la colección desde el archivo `postman_collection.json` (si está disponible)
2. O crea manualmente las requests usando los endpoints descritos arriba

---

## 🎨 Frontend - Componente de KPIs

El componente `KpiInputPanel` ya está configurado para conectarse con el backend.

### Uso básico:

```jsx
import { KpiInputPanel } from './components/KpiInputPanel';

function App() {
  return (
    <KpiInputPanel 
      area="Inventario"
      direccion="Operaciones"
      usuario="usuario@example.com"
      onSaveKpi={(kpiData) => {
        console.log('KPI guardado:', kpiData);
      }}
    />
  );
}
```

---

## 📋 Estructura de la Tabla `kpi_registros`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | ID único del registro (auto-incremental) |
| `area` | VARCHAR(100) | Área del KPI (Inventario, Logística, etc.) |
| `indicador` | VARCHAR(255) | Nombre del indicador |
| `valor` | DECIMAL(15,2) | Valor calculado del KPI |
| `unidad` | VARCHAR(20) | Unidad de medida (%, días, h, etc.) |
| `cumple_meta` | BOOLEAN | Si cumple con la meta establecida |
| `meta` | DECIMAL(15,2) | Meta establecida para el KPI |
| `datos_entrada` | JSONB | JSON con los datos ingresados |
| `direccion` | VARCHAR(100) | Dirección organizacional |
| `usuario` | VARCHAR(255) | Usuario que registró el KPI |
| `fecha_registro` | TIMESTAMP | Fecha y hora del registro |
| `observaciones` | TEXT | Comentarios adicionales |

---

## 📊 Funciones SQL Disponibles

### Obtener último KPI:
```sql
SELECT * FROM obtener_ultimo_kpi('Inventario', 'Exactitud de inventario');
```

### Obtener histórico:
```sql
SELECT * FROM obtener_historico_kpi('Inventario', 'Exactitud de inventario', 30);
```

### Vista de resumen:
```sql
SELECT * FROM vista_kpis_resumen WHERE area = 'Inventario';
```

---

## ✅ Verificación de la Instalación

### 1. Verificar tabla en Supabase:
```sql
SELECT * FROM kpi_registros LIMIT 10;
```

### 2. Verificar servidor backend:
```bash
curl http://localhost:3000/api/status
```

Deberías recibir:
```json
{
  "message": "API is running",
  "version": "1.0.0",
  "timestamp": "2025-11-14T..."
}
```

### 3. Verificar endpoint de KPIs:
```bash
curl http://localhost:3000/api/kpis/resumen
```

---

## 🐛 Solución de Problemas

### Error: "relation kpi_registros does not exist"
- **Solución**: Ejecuta el script SQL completo en Supabase

### Error: "Cannot find module './kpiService'"
- **Solución**: Verifica que todos los archivos estén en las rutas correctas
- Reinicia el servidor con `npm run dev`

### Error: "CORS policy"
- **Solución**: Verifica que el middleware de CORS esté configurado en `server.js`

### Frontend no guarda datos
- **Solución**: 
  1. Verifica que el backend esté corriendo en `http://localhost:3000`
  2. Abre las DevTools del navegador (F12) y revisa la consola
  3. Verifica la pestaña Network para ver las requests

---

## 📞 Soporte

Si tienes problemas con la configuración:

1. Verifica los logs del servidor: `npm run dev`
2. Revisa los logs de Supabase en el dashboard
3. Comprueba que todas las variables de entorno estén configuradas

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu sistema de KPIs estará completamente funcional:

✅ Base de datos configurada en Supabase  
✅ Backend con API REST funcionando  
✅ Frontend con paneles interactivos  
✅ Guardado y recuperación de datos  
✅ Cálculo automático de indicadores  
✅ Validación de metas  

¡Ahora puedes comenzar a registrar KPIs! 🚀
