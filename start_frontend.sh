#!/bin/bash

# Script de démarrage du Frontend NutriPredict
echo "Démarrage du Frontend NutriPredict..."

# Vérifier si nous sommes dans le bon dossier
if [ ! -d "frontend/nutriscore-frontend" ]; then
    echo "Erreur: Veuillez exécuter ce script depuis la racine du projet"
    echo "Structure attendue: frontend/nutriscore-frontend/"
    exit 1
fi

# Aller dans le dossier frontend
cd frontend/nutriscore-frontend

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances NPM..."
    npm install
fi

# Démarrer l'application
echo "Démarrage du serveur Vite..."
echo "URL: http://localhost:5173"
echo ""
echo "Pour arrêter le serveur, appuyez sur Ctrl+C"
echo "=================================="

npm run dev