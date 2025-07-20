#!/bin/bash

# 🔧 Script de démarrage du Backend NutriPredict
echo "Démarrage du Backend NutriPredict..."

# Vérifier si nous sommes dans le bon dossier
if [ ! -d "backend" ]; then
    echo "Erreur: Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

# Aller dans le dossier backend
cd backend

# Vérifier si l'environnement virtuel existe
if [ ! -d "../.venv" ]; then
    echo "Environnement virtuel non trouvé. Création..."
    cd ..
    python3 -m venv .venv
    cd backend
fi

# Activer l'environnement virtuel
echo "🔧 Activation de l'environnement virtuel..."
source ../.venv/bin/activate

# Installer les dépendances si nécessaire
echo "Vérification des dépendances..."
pip install -r requirements.txt

# Démarrer l'application
echo "Démarrage du serveur Flask..."
echo "Backend API: http://127.0.0.1:5001"
echo "Documentation: http://127.0.0.1:5001/api/health"
echo "IA Models: ../ia/models/"
echo ""
echo "Pour arrêter le serveur, appuyez sur Ctrl+C"
echo "=================================="

python app.py