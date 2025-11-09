#!/bin/bash

# Script para configurar la base de datos WorldInInk con Docker
# Uso: ./setup-database.sh

set -e

echo "🚀 Configurando base de datos WorldInInk..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está disponible
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose no está disponible. Por favor instala Docker Compose."
    exit 1
fi

# Determinar el comando de Docker Compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

print_step "1. Deteniendo contenedores existentes (si los hay)..."
$DOCKER_COMPOSE down -v 2>/dev/null || true

print_step "2. Creando directorio para scripts de inicialización..."
mkdir -p init-scripts

print_step "3. Levantando PostgreSQL en Docker..."
$DOCKER_COMPOSE up -d postgres

print_step "4. Esperando a que PostgreSQL esté listo..."
echo "Esto puede tomar unos segundos..."

# Esperar hasta que PostgreSQL esté listo
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if $DOCKER_COMPOSE exec postgres pg_isready -U postgres -d worldinink &> /dev/null; then
        print_message "PostgreSQL está listo!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "PostgreSQL no se pudo inicializar después de $max_attempts intentos"
        exit 1
    fi
    
    echo "Intento $attempt/$max_attempts - Esperando..."
    sleep 2
    ((attempt++))
done

print_step "5. Verificando conexión a la base de datos..."
if $DOCKER_COMPOSE exec postgres psql -U postgres -d worldinink -c "SELECT version();" &> /dev/null; then
    print_message "Conexión a la base de datos exitosa!"
else
    print_error "No se pudo conectar a la base de datos"
    exit 1
fi

print_step "6. Configurando variables de entorno..."
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado. Creando uno nuevo..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/worldinink"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OpenAI (para funciones de IA)
OPENAI_API_KEY=""

# Assistant ID (opcional)
ASSISTANT_ID=""
EOF
    print_message "Archivo .env creado. Por favor configura las variables necesarias."
else
    print_message "Archivo .env ya existe."
fi

print_step "7. Ejecutando migraciones de Prisma..."
if command -v npm &> /dev/null; then
    npm run postinstall
    npx prisma db push
    print_message "Migraciones ejecutadas exitosamente!"
else
    print_warning "npm no encontrado. Ejecuta manualmente:"
    echo "  npm install"
    echo "  npx prisma generate"
    echo "  npx prisma db push"
fi

echo ""
print_message "✅ ¡Base de datos configurada exitosamente!"
echo ""
echo -e "${BLUE}📋 Información de conexión:${NC}"
echo "  Host: localhost"
echo "  Puerto: 5432"
echo "  Base de datos: worldinink"
echo "  Usuario: postgres"
echo "  Contraseña: postgres"
echo ""
echo -e "${BLUE}🔧 Comandos útiles:${NC}"
echo "  Detener BD:     $DOCKER_COMPOSE down"
echo "  Iniciar BD:     $DOCKER_COMPOSE up -d postgres"
echo "  Ver logs:       $DOCKER_COMPOSE logs -f postgres"
echo "  Acceder a BD:   $DOCKER_COMPOSE exec postgres psql -U postgres -d worldinink"
echo "  Adminer Web:    http://localhost:8080 (opcional)"
echo ""
echo -e "${GREEN}🚀 ¡Listo para desarrollar!${NC}"
