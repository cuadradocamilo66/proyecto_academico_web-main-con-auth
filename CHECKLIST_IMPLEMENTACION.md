# ✅ Checklist de Implementación - Sistema de Autenticación

Usa este checklist para asegurarte de completar todos los pasos correctamente.

## 📋 Pre-requisitos

- [ ] Cuenta en Supabase creada (https://supabase.com)
- [ ] Proyecto en Supabase creado
- [ ] Node.js instalado en tu computadora
- [ ] Editor de código (VS Code recomendado)

---

## 🔧 Configuración de Supabase

### Paso 1: Obtener Credenciales
- [ ] Ir a Settings → API en tu proyecto de Supabase
- [ ] Copiar la **Project URL**
- [ ] Copiar la **anon/public key**

### Paso 2: Configurar Authentication
- [ ] Ir a Authentication → Providers
- [ ] Verificar que **Email** esté habilitado
- [ ] (Opcional) Deshabilitar confirmación de email para desarrollo:
  - [ ] Ir a Authentication → Settings
  - [ ] Desmarcar "Enable email confirmations"

### Paso 3: Ejecutar Script SQL Principal
- [ ] Abrir SQL Editor en Supabase
- [ ] Abrir archivo `scripts/000-setup-auth-CORRECTED.sql`
- [ ] Copiar TODO el contenido
- [ ] Pegar en SQL Editor
- [ ] Hacer clic en **Run** o presionar Ctrl/Cmd + Enter
- [ ] Verificar que no haya errores (debe decir "Success")

### Paso 4: Verificar Instalación de Base de Datos
- [ ] Ejecutar en SQL Editor:
```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```
- [ ] Confirmar que aparece `teacher_profiles`

- [ ] Ejecutar:
```sql
-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
- [ ] Confirmar que todas las tablas muestran `rowsecurity = true`

---

## 💻 Configuración del Proyecto

### Paso 5: Variables de Entorno
- [ ] Crear archivo `.env.local` en la raíz del proyecto
- [ ] Copiar contenido de `.env.example`
- [ ] Pegar tus credenciales de Supabase:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL=` tu URL
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=` tu anon key
- [ ] Guardar el archivo

### Paso 6: Instalar Dependencias
- [ ] Abrir terminal en la raíz del proyecto
- [ ] Ejecutar: `npm install`
- [ ] Esperar a que termine (puede tomar unos minutos)
- [ ] Verificar que no haya errores

### Paso 7: Iniciar el Servidor de Desarrollo
- [ ] Ejecutar: `npm run dev`
- [ ] Abrir navegador en http://localhost:3000
- [ ] Verificar que la aplicación cargue

---

## 👤 Pruebas de Autenticación

### Paso 8: Registro de Usuario
- [ ] Ir a http://localhost:3000/auth/register
- [ ] Completar el formulario:
  - [ ] Nombre
  - [ ] Apellido
  - [ ] Email
  - [ ] Contraseña (mínimo 6 caracteres)
  - [ ] Confirmar contraseña
- [ ] Hacer clic en "Crear Cuenta"
- [ ] Verificar mensaje de éxito
- [ ] Esperar redirección a login

### Paso 9: Inicio de Sesión
- [ ] Ir a http://localhost:3000/auth/login (o esperar redirección)
- [ ] Ingresar email y contraseña
- [ ] Hacer clic en "Iniciar Sesión"
- [ ] Verificar que se muestre el dashboard
- [ ] Verificar que tu nombre aparezca en la esquina superior derecha

### Paso 10: Verificar Perfil
- [ ] Hacer clic en tu avatar (esquina superior derecha)
- [ ] Verificar que aparezca tu nombre completo
- [ ] Verificar que aparezca tu email
- [ ] Hacer clic en "Cerrar Sesión"
- [ ] Verificar que te redirija a /auth/login

### Paso 11: Recuperación de Contraseña
- [ ] Ir a http://localhost:3000/auth/forgot-password
- [ ] Ingresar tu email
- [ ] Hacer clic en "Enviar Enlace"
- [ ] Verificar mensaje de éxito
- [ ] (Opcional) Revisar tu email para el enlace de recuperación

---

## 🔄 Migración de Datos (SOLO SI TIENES DATOS EXISTENTES)

### Paso 12: Verificar si Necesitas Migrar
- [ ] Ejecutar en SQL Editor:
```sql
SELECT COUNT(*) FROM public.courses WHERE user_id IS NULL;
```
- [ ] Si el resultado es mayor a 0, necesitas migrar

### Paso 13: Migrar Datos
- [ ] Obtener tu User ID:
```sql
SELECT id, email FROM auth.users;
```
- [ ] Copiar el `id` de tu usuario

- [ ] Abrir archivo `scripts/001-migrate-existing-data.sql`
- [ ] Buscar la línea con `PEGA-AQUI-TU-USER-ID`
- [ ] Reemplazar con tu ID real
- [ ] Descomentar el bloque DO $$ (quitar los /* y */)
- [ ] Ejecutar el script en SQL Editor
- [ ] Verificar mensajes de éxito

### Paso 14: Verificar Migración
- [ ] Ejecutar:
```sql
SELECT COUNT(*) FROM public.courses WHERE user_id IS NULL;
```
- [ ] El resultado debe ser 0 (cero)

---

## 🛠️ Actualización de Código

### Paso 15: Actualizar Servicios
Debes actualizar estos archivos para incluir `user_id`:

- [ ] `lib/courses-service.ts`
  - [ ] Importar `getCurrentUser` de auth-service
  - [ ] Agregar verificación de usuario en cada función
  - [ ] Filtrar por `user_id` en queries SELECT
  - [ ] Incluir `user_id` en INSERT/UPDATE
  - [ ] Usar `courses-service-updated.ts` como referencia

- [ ] `lib/students-service.ts`
  - [ ] Aplicar mismo patrón que courses

- [ ] `lib/planning-service.ts`
  - [ ] Aplicar mismo patrón que courses

- [ ] `lib/observations-service.ts`
  - [ ] Aplicar mismo patrón que courses

- [ ] `lib/agenda-service.ts`
  - [ ] Aplicar mismo patrón que courses

### Paso 16: Probar Funcionalidades
Después de actualizar los servicios:

- [ ] Crear un curso nuevo
  - [ ] Verificar que se guarde correctamente
  - [ ] Verificar que aparezca en la lista

- [ ] Crear un estudiante nuevo
  - [ ] Verificar que se guarde correctamente
  - [ ] Verificar que aparezca en la lista

- [ ] Crear una planeación
  - [ ] Verificar que se guarde correctamente

- [ ] Cerrar sesión y volver a iniciar sesión
  - [ ] Verificar que tus datos sigan ahí

- [ ] (Opcional) Crear una segunda cuenta de usuario
  - [ ] Verificar que NO vea los datos del primer usuario
  - [ ] Verificar que solo vea sus propios datos

---

## ✨ Funcionalidades Adicionales (Opcional)

### Paso 17: Personalización de Perfil
- [ ] Crear página de perfil de usuario
- [ ] Permitir editar nombre, institución, especialidad
- [ ] Permitir subir foto de perfil

### Paso 18: OAuth (Login con Google/GitHub)
- [ ] Configurar provider en Supabase
- [ ] Agregar botones de OAuth en login/register
- [ ] Probar flujo de OAuth

### Paso 19: Email Templates
- [ ] Personalizar plantillas en Supabase
- [ ] Probar emails de confirmación
- [ ] Probar emails de recuperación

---

## 🐛 Solución de Problemas

Si algo no funciona, revisa:

- [ ] Las variables de entorno están correctamente configuradas
- [ ] El script SQL se ejecutó sin errores
- [ ] RLS está habilitado en todas las tablas
- [ ] Las políticas de seguridad existen
- [ ] El servidor de desarrollo está corriendo
- [ ] La consola del navegador no muestra errores
- [ ] Los servicios están actualizados con `user_id`

---

## 🎉 ¡Completado!

Si marcaste todas las casillas relevantes, tu sistema de autenticación está:

✅ Correctamente configurado
✅ Funcionando correctamente
✅ Seguro (con RLS)
✅ Listo para producción

---

## 📝 Notas Finales

- Guarda este checklist para futuras referencias
- Documenta cualquier cambio que hagas
- Haz backup regular de tu base de datos
- Considera implementar tests automatizados

**¿Problemas?** Revisa `GUIA_AUTENTICACION.md` para más detalles.
