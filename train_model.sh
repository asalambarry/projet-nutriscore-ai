#!/bin/bash

#  Script d'entraînement des modèles IA NutriPredict
echo "Entraînement des modèles IA NutriPredict..."

# Vérifier si nous sommes dans le bon dossier
if [ ! -d "ia/scripts" ] || [ ! -d "ia/data" ]; then
    echo "Erreur: Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

# Vérifier si le fichier de données existe
if [ ! -f "ia/data/produits_alimentaires_nettoyes.csv" ]; then
    echo " Erreur: Fichier de données non trouvé: ia/data/produits_alimentaires_nettoyes.csv"
    exit 1
fi

# Aller dans le dossier des scripts IA
cd ia/scripts

# Vérifier si l'environnement virtuel existe
if [ ! -d "../../.venv" ]; then
    echo "Environnement virtuel non trouvé. Création..."
    cd ../..
    python3 -m venv .venv
    cd ia/scripts
fi

# Activer l'environnement virtuel
echo "🔧 Activation de l'environnement virtuel..."
source ../../.venv/bin/activate

# Installer les dépendances si nécessaire
echo "Vérification des dépendances..."
pip install pandas numpy scikit-learn joblib

# Lancer l'entraînement
echo "Démarrage de l'entraînement du modèle..."
echo " Données: ../data/produits_alimentaires_nettoyes.csv"
echo "Sauvegarde: ../models/"
echo "=================================="

python train_model.py

echo ""
echo " Entraînement terminé !"
echo "Modèles sauvegardés dans: ia/models/"