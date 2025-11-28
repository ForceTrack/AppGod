#!/bin/bash

# Script de inicio para Reni
# Este script facilita iniciar el proyecto completo

echo "🏋️  Reni - Sistema de Corrección de Ejercicios con IA"
echo "======================================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Instala Node.js desde: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js instalado:${NC} $(node --version)"
echo -e "${GREEN}✅ npm instalado:${NC} $(npm --version)"
echo ""

# Verificar dependencias frontend
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias del frontend...${NC}"
    cd frontend
    npm install
    cd ..
    echo ""
fi

# Verificar dependencias backend
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias del backend...${NC}"
    cd backend
    npm install
    cd ..
    echo ""
fi

# Verificar archivo .env
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  No se encontró archivo .env${NC}"
    echo "Creando .env desde .env.example..."
    cp backend/.env.example backend/.env
    echo -e "${BLUE}💡 Edita backend/.env y agrega tu OPENAI_API_KEY${NC}"
    echo ""
fi

# Preguntar qué iniciar
echo "¿Qué deseas iniciar?"
echo "1) Frontend + Backend (recomendado)"
echo "2) Solo Frontend"
echo "3) Solo Backend"
echo "4) Salir"
echo ""
read -p "Selecciona una opción (1-4): " option

case $option in
    1)
        echo ""
        echo -e "${GREEN}🚀 Iniciando Frontend y Backend...${NC}"
        echo ""
        echo -e "${BLUE}Backend estará en: http://localhost:3001${NC}"
        echo -e "${BLUE}Frontend estará en: http://localhost:3000${NC}"
        echo ""
        echo -e "${YELLOW}Presiona Ctrl+C para detener ambos servicios${NC}"
        echo ""
        
        # Iniciar backend en background
        cd backend
        npm start &
        BACKEND_PID=$!
        cd ..
        
        # Esperar un poco para que el backend inicie
        sleep 3
        
        # Iniciar frontend
        cd frontend
        npm start
        
        # Al cerrar el frontend, también cerrar el backend
        kill $BACKEND_PID
        ;;
    2)
        echo ""
        echo -e "${GREEN}🚀 Iniciando solo Frontend...${NC}"
        echo -e "${YELLOW}⚠️  Recuerda iniciar el backend manualmente si necesitas OpenAI${NC}"
        echo ""
        cd frontend
        npm start
        ;;
    3)
        echo ""
        echo -e "${GREEN}🚀 Iniciando solo Backend...${NC}"
        echo -e "${BLUE}Backend estará en: http://localhost:3001${NC}"
        echo ""
        cd backend
        npm start
        ;;
    4)
        echo "👋 ¡Hasta luego!"
        exit 0
        ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac
