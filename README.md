# 🎓 EduGestión - Plataforma Académica para Docentes

Plataforma web completa de gestión académica, pedagógica y administrativa diseñada específicamente para docentes.

## ✨ Características Principales

### 📚 Gestión Académica
- **Cursos**: Administra múltiples materias y grupos
- **Estudiantes**: Registro completo con datos personales, médicos y de acudientes
- **Calificaciones**: Sistema de calificaciones por períodos (P1, P2, P3, P4)
- **Planeación Semanal**: Planificación pedagógica con unidades, competencias e indicadores
- **Observaciones**: Registro de observaciones académicas, comportamentales y de asistencia

### 📊 Seguimiento y Reportes
- **Dashboard**: Vista general con estadísticas y accesos rápidos
- **Reportes**: Generación y exportación a Excel
- **Diario**: Registro de actividades diarias
- **Agenda**: Gestión de eventos y fechas importantes

### 🔐 Sistema de Autenticación Multi-Usuario
- **Registro e inicio de sesión** seguro
- **Recuperación de contraseña** por email
- **Perfiles de usuario** personalizables
- **Aislamiento de datos** por usuario (cada docente ve solo sus datos)
- **Row Level Security (RLS)** en base de datos

## 🛠️ Tecnologías

- **Framework**: Next.js 16 (React 19) con TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui (Radix UI)
- **Formularios**: React Hook Form + Zod
- **Gráficas**: Recharts
- **Exportación**: XLSX

## 🚀 Inicio Rápido

### Pre-requisitos

- Node.js 18+ instalado
- Cuenta en Supabase (https://supabase.com)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/cuadradocamilo66/proyecto_academico_web.git
cd proyecto_academico_web
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```
Edita `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

4. **Configurar la base de datos**
- Abre Supabase SQL Editor
- Ejecuta el script `scripts/000-setup-auth-CORRECTED.sql`
- (Opcional) Si tienes datos existentes, ejecuta `scripts/001-migrate-existing-data.sql`

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

## 📖 Documentación

- **[GUIA_AUTENTICACION.md](./GUIA_AUTENTICACION.md)**: Guía completa de configuración del sistema de autenticación
- **[CHECKLIST_IMPLEMENTACION.md](./CHECKLIST_IMPLEMENTACION.md)**: Checklist paso a paso para la implementación
- **[RESUMEN_AUTENTICACION.md](./RESUMEN_AUTENTICACION.md)**: Resumen técnico de la implementación

## 📁 Estructura del Proyecto

```
proyecto_academico_web/
├── app/                      # Páginas de Next.js
│   ├── auth/                # Páginas de autenticación
│   │   ├── login/          # Inicio de sesión
│   │   ├── register/       # Registro
│   │   └── forgot-password/ # Recuperación de contraseña
│   ├── cursos/             # Gestión de cursos
│   ├── estudiantes/        # Gestión de estudiantes
│   ├── calificaciones/     # Sistema de calificaciones
│   ├── planeacion/         # Planeación semanal
│   ├── observaciones/      # Observaciones de estudiantes
│   ├── diario/             # Diario del docente
│   ├── agenda/             # Agenda y eventos
│   ├── reportes/           # Reportes y exportación
│   └── configuracion/      # Configuración de la cuenta
├── components/              # Componentes React
│   ├── layout/             # Layouts y navegación
│   ├── ui/                 # Componentes de UI (shadcn)
│   └── [modulo]/           # Componentes por módulo
├── lib/                     # Utilidades y servicios
│   ├── auth-service.ts     # Servicio de autenticación
│   ├── auth-context.tsx    # Contexto de autenticación
│   ├── auth-types.ts       # Tipos de autenticación
│   ├── supabase/           # Cliente de Supabase
│   ├── types.ts            # Tipos TypeScript
│   └── [service].ts        # Servicios por módulo
├── scripts/                 # Scripts SQL
│   ├── 000-setup-auth-CORRECTED.sql  # Configuración inicial
│   └── 001-migrate-existing-data.sql # Migración de datos
└── middleware.ts           # Middleware de autenticación
```

## 🔒 Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Políticas de acceso por usuario configuradas
- ✅ Validación de permisos a nivel de base de datos
- ✅ Hash automático de contraseñas con Supabase Auth
- ✅ Tokens JWT para gestión de sesiones
- ✅ Middleware de Next.js para protección de rutas

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autor

**Camilo Cuadrado**
- GitHub: [@cuadradocamilo66](https://github.com/cuadradocamilo66)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub
