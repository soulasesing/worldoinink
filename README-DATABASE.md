# 🐘 Configuración de Base de Datos PostgreSQL

Este documento explica cómo configurar y restaurar la base de datos PostgreSQL para WorldInInk usando Docker.

## 🚀 Configuración Rápida

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecutar el script de configuración automática
./setup-database.sh
```

Este script:
- ✅ Levanta PostgreSQL en Docker
- ✅ Crea la base de datos `worldinink`
- ✅ Configura las variables de entorno
- ✅ Ejecuta las migraciones de Prisma
- ✅ Verifica la conexión

### Opción 2: Manual

```bash
# 1. Levantar PostgreSQL
docker-compose up -d postgres

# 2. Esperar a que esté listo
docker-compose logs -f postgres

# 3. Configurar variables de entorno
cp env.example .env
# Edita .env con tus valores

# 4. Ejecutar migraciones
npm install
npx prisma generate
npx prisma db push
```

## 📋 Información de Conexión

```
Host: localhost
Puerto: 5432
Base de datos: worldinink
Usuario: postgres
Contraseña: postgres
```

**URL de conexión:**
```
postgresql://postgres:postgres@localhost:5432/worldinink
```

## 🛠️ Comandos Útiles

### Docker Compose

```bash
# Iniciar base de datos
docker-compose up -d postgres

# Detener base de datos
docker-compose down

# Ver logs
docker-compose logs -f postgres

# Reiniciar con datos limpios
docker-compose down -v
docker-compose up -d postgres
```

### Acceso Directo a PostgreSQL

```bash
# Conectar via psql
docker-compose exec postgres psql -U postgres -d worldinink

# Ejecutar comando SQL
docker-compose exec postgres psql -U postgres -d worldinink -c "SELECT * FROM \"User\";"

# Crear respaldo
docker-compose exec postgres pg_dump -U postgres worldinink > backup.sql

# Restaurar respaldo
docker-compose exec -T postgres psql -U postgres -d worldinink < backup.sql
```

### Prisma

```bash
# Generar cliente
npx prisma generate

# Aplicar esquema a BD
npx prisma db push

# Ver datos en Prisma Studio
npx prisma studio

# Reset completo de BD
npx prisma db push --force-reset

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion
```

## 🌐 Adminer (Interfaz Web)

Si levantaste el servicio completo, puedes acceder a Adminer:

```
URL: http://localhost:8080
Sistema: PostgreSQL
Servidor: postgres
Usuario: postgres
Contraseña: postgres
Base de datos: worldinink
```

## 🔧 Troubleshooting

### Error: Puerto 5432 ocupado

```bash
# Ver qué proceso usa el puerto
lsof -i :5432

# Detener PostgreSQL local si existe
brew services stop postgresql
# o
sudo systemctl stop postgresql
```

### Error: Contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs postgres

# Limpiar volúmenes
docker-compose down -v
docker volume prune
```

### Error: Prisma no conecta

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   docker-compose ps
   ```

2. Verifica la URL en `.env`:
   ```bash
   cat .env | grep DATABASE_URL
   ```

3. Prueba la conexión:
   ```bash
   npx prisma db pull
   ```

## 📊 Esquema de Base de Datos

El proyecto incluye las siguientes tablas:

- **User** - Usuarios del sistema
- **Account** - Cuentas OAuth (NextAuth)
- **Session** - Sesiones de usuario (NextAuth)
- **Story** - Historias de los usuarios
- **Character** - Personajes creados
- **Subscription** - Suscripciones Stripe

### Relaciones Principales

```
User 1:N Story (autor)
User 1:N Character (creador)
User 1:1 Subscription
Story N:M Character (personajes en historias)
```

## 🔄 Respaldos Automáticos

Para crear respaldos automáticos, puedes usar este script:

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_worldinink_$DATE.sql"

docker-compose exec postgres pg_dump -U postgres worldinink > "backups/$BACKUP_FILE"
echo "Respaldo creado: $BACKUP_FILE"

# Mantener solo los últimos 7 respaldos
ls -t backups/backup_worldinink_*.sql | tail -n +8 | xargs rm -f
```

## 🚀 Producción

Para producción, considera:

1. **Variables de entorno seguras**
2. **Respaldos automáticos**
3. **Monitoreo de performance**
4. **Conexiones SSL**
5. **Usuarios con permisos limitados**

```env
# Ejemplo para producción
DATABASE_URL="postgresql://worldinink_user:secure_password@db.example.com:5432/worldinink_prod?sslmode=require"
```
