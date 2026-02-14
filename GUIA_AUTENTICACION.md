# 🔐 Guía de Configuración de Autenticación

Esta guía te ayudará a configurar el sistema de autenticación multi-usuario en tu plataforma EduGestión.

## 📋 Tabla de Contenidos

1. [Configuración de Supabase](#1-configuración-de-supabase)
2. [Configuración del Proyecto](#2-configuración-del-proyecto)
3. [Ejecutar Migraciones SQL](#3-ejecutar-migraciones-sql)
4. [Probar el Sistema](#4-probar-el-sistema)
5. [Modificar Servicios Existentes](#5-modificar-servicios-existentes)
6. [Solución de Problemas](#6-solución-de-problemas)

---

## 1. Configuración de Supabase

### 1.1 Crear una cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

### 1.2 Obtener las credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL**: Tu URL de Supabase
   - **anon/public key**: Tu clave pública (anon key)

### 1.3 Configurar Authentication

1. Ve a **Authentication** → **Providers**
2. Asegúrate de que **Email** esté habilitado
3. (Opcional) Configura la confirmación por email:
   - En **Authentication** → **Settings**
   - Puedes deshabilitar "Enable email confirmations" para desarrollo

---

## 2. Configuración del Proyecto

### 2.1 Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

2. Edita `.env.local` y agrega tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 2.2 Instalar Dependencias

Si aún no lo has hecho:

```bash
npm install
```

---

## 3. Ejecutar Migraciones SQL

### 3.1 Abrir el SQL Editor de Supabase

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Haz clic en **New query**

### 3.2 Ejecutar el script de configuración

1. Abre el archivo `scripts/000-setup-auth-CORRECTED.sql` ⚠️ **USA LA VERSIÓN CORREGIDA**
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (o presiona Ctrl/Cmd + Enter)

Este script creará:
- ✅ Tabla `teacher_profiles` para perfiles de docentes
- ✅ Columna `user_id` en todas las tablas existentes (courses, students, weekly_planning, observations, events, grades)
- ✅ Políticas de seguridad (RLS) en todas las tablas
- ✅ Triggers automáticos para crear perfiles y actualizar timestamps
- ✅ Índices para mejorar el rendimiento

**IMPORTANTE**: El script usa bloques `DO $$` para verificar si las columnas ya existen antes de crearlas, por lo que es **seguro ejecutarlo múltiples veces**.

### 3.3 Verificar la instalación

En el SQL Editor, ejecuta:

```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## 4. Probar el Sistema

### 4.0 Migrar Datos Existentes (SOLO SI YA TIENES DATOS)

**⚠️ IMPORTANTE**: Si ya tienes cursos, estudiantes u otros datos en tu base de datos ANTES de implementar la autenticación, necesitas asignarlos a un usuario.

1. **Primero registra un usuario** en la aplicación (ve al paso 4.2)
2. **Obtén tu User ID**:
   - Ve al SQL Editor de Supabase
   - Ejecuta: `SELECT id, email FROM auth.users;`
   - Copia el `id` de tu usuario

3. **Ejecuta el script de migración**:
   - Abre el archivo `scripts/001-migrate-existing-data.sql`
   - Sigue las instrucciones del archivo
   - Reemplaza `PEGA-AQUI-TU-USER-ID` con tu ID real
   - Ejecuta el script

**Si estás empezando desde cero (sin datos existentes)**, puedes saltarte este paso.

### 4.1 Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 4.2 Registrar un usuario

1. Ve a [http://localhost:3000/auth/register](http://localhost:3000/auth/register)
2. Completa el formulario de registro:
   - Nombre
   - Apellido
   - Email
   - Contraseña (mínimo 6 caracteres)
3. Haz clic en "Crear Cuenta"

### 4.3 Iniciar sesión

1. Ve a [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
2. Ingresa tu email y contraseña
3. Haz clic en "Iniciar Sesión"
4. Serás redirigido al dashboard

### 4.4 Verificar el perfil

1. Una vez autenticado, haz clic en tu avatar en la esquina superior derecha
2. Deberías ver tu nombre y email
3. Puedes cerrar sesión desde ese menú

---

## 5. Modificar Servicios Existentes

Para que los servicios existentes funcionen con multi-usuario, necesitas agregar el `user_id` a todas las operaciones.

### 5.1 Ejemplo: Modificar el servicio de cursos

Abre `lib/courses-service.ts` y modifica las funciones para incluir el `user_id`:

```typescript
import { supabase } from "./supabase/client"
import { getCurrentUser } from "./auth-service"

export async function getCourses() {
  const user = await getCurrentUser()
  if (!user) throw new Error("No autenticado")

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id) // Solo cursos del usuario actual
    
  if (error) throw error
  return data
}

export async function createCourse(courseData: any) {
  const user = await getCurrentUser()
  if (!user) throw new Error("No autenticado")

  const { data, error } = await supabase
    .from("courses")
    .insert([{ 
      ...courseData, 
      user_id: user.id // Asociar curso al usuario
    }])
    .select()
    
  if (error) throw error
  return data
}
```

### 5.2 Servicios a modificar

Debes aplicar el mismo patrón a:

- ✅ `lib/courses-service.ts`
- ✅ `lib/students-service.ts`
- ✅ `lib/planning-service.ts`
- ✅ `lib/observations-service.ts`
- ✅ `lib/agenda-service.ts`

---

## 6. Solución de Problemas

### Error: "No autenticado"

**Causa**: El usuario no ha iniciado sesión.

**Solución**: 
- Asegúrate de haber iniciado sesión
- Verifica que el middleware esté funcionando
- Revisa la consola del navegador para errores

### Error: "relation does not exist"

**Causa**: Las tablas no se crearon correctamente.

**Solución**:
- Vuelve a ejecutar el script SQL `000-setup-auth.sql`
- Verifica que estés conectado al proyecto correcto en Supabase

### Error: "permission denied for table"

**Causa**: Las políticas RLS no están configuradas correctamente.

**Solución**:
- Ejecuta nuevamente la sección de políticas RLS del script SQL
- Verifica que RLS esté habilitado: `ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;`

### No se crea el perfil automáticamente

**Causa**: El trigger no está funcionando.

**Solución**:
1. Verifica que el trigger existe:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. Si no existe, ejecuta nuevamente la sección del trigger en el script SQL

### Los cursos/estudiantes de otros usuarios son visibles

**Causa**: Las políticas RLS no están funcionando.

**Solución**:
1. Verifica que RLS esté habilitado en todas las tablas
2. Revisa que las políticas estén activas:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## 🎉 ¡Listo!

Tu plataforma ahora tiene un sistema de autenticación completo. Cada docente tendrá:

- ✅ Su propia cuenta con email y contraseña
- ✅ Acceso exclusivo a sus cursos y estudiantes
- ✅ Perfil personalizable
- ✅ Recuperación de contraseña
- ✅ Seguridad a nivel de base de datos (RLS)

## 📚 Próximos Pasos

1. **Personalizar el perfil**: Agrega campos adicionales al perfil de docente
2. **Email de confirmación**: Configura plantillas de email en Supabase
3. **Roles y permisos**: Implementa diferentes niveles de acceso
4. **OAuth**: Agrega login con Google, GitHub, etc.
5. **Sesiones**: Configura la duración de las sesiones

## 🆘 Soporte

Si tienes problemas, revisa:
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- Los logs en la consola del navegador y del servidor
