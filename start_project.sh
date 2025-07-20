#!/bin/bash

# Script de démarrage global NutriPredict
echo "Démarrage de NutriPredict - Projet complet"
echo "============================================="

# Fonction pour démarrer en arrière-plan avec gestion d'erreur
start_service() {
    local service_name=$1
    local script_name=$2
    local log_file=$3

    echo "Démarrage de $service_name..."
    ./$script_name > $log_file 2>&1 &
    local pid=$!
    echo "$service_name démarré (PID: $pid) - Logs: $log_file"
    return $pid
}

# Vérifier la structure du projet
if [ ! -d "backend" ] || [ ! -d "frontend" ] || [ ! -d "ia" ]; then
    echo " Erreur: Structure de projet invalide"
    echo "Assurez-vous d'être dans le dossier racine du projet"
    exit 1
fi

# Créer le dossier de logs
mkdir -p logs

echo ""
echo " Options de démarrage:"
echo "1) Démarrage complet (Backend + Frontend)"
echo "2) Backend seulement"
echo "3) Frontend seulement"
echo "4) Entraînement IA"
echo "5) Afficher les statuts"
echo "6) Arrêter les services"
read -p "Choisissez une option (1-6): " choice

case $choice in
    1)
        echo ""
        echo "Démarrage complet du projet..."

        # Démarrer le backend
        start_service "Backend API" "start_backend.sh" "logs/backend.log"
        backend_pid=$!

        # Attendre un peu pour que le backend démarre
        sleep 3

        # Démarrer le frontend
        start_service "Frontend React" "start_frontend.sh" "logs/frontend.log"
        frontend_pid=$!

        echo ""
        echo " Services démarrés avec succès !"
        echo " Backend API: http://127.0.0.1:5001"
        echo " Frontend: http://localhost:5174"
        echo ""
        echo "  Logs en temps réel:"
        echo "  Backend: tail -f logs/backend.log"
        echo "  Frontend: tail -f logs/frontend.log"
        echo ""
        echo " Pour arrêter: ./start_project.sh et choisir option 6"
        ;;

    2)
        echo ""
        echo " Démarrage du Backend seulement..."
        ./start_backend.sh
        ;;

    3)
        echo ""
        echo " Démarrage du Frontend seulement..."
        ./start_frontend.sh
        ;;

    4)
        echo ""
        echo " Entraînement des modèles IA..."
        ./train_model.sh
        ;;

    5)
        echo ""
        echo " Statut des services:"
        echo "======================="

        # Vérifier Backend
        if curl -s http://127.0.0.1:5001/api/health > /dev/null 2>&1; then
            echo " Backend API: En ligne (http://127.0.0.1:5001)"
        else
            echo " Backend API: Hors ligne"
        fi

        # Vérifier Frontend
        if curl -s http://localhost:5174 > /dev/null 2>&1; then
            echo " Frontend: En ligne (http://localhost:5174)"
        else
            echo " Frontend: Hors ligne"
        fi

        # Vérifier les processus
        echo ""
        echo " Processus actifs:"
        pgrep -f "python.*app.py" && echo "  - Backend Python actif" || echo "  - Aucun backend détecté"
        pgrep -f "vite" && echo "  - Frontend Vite actif" || echo "  - Aucun frontend détecté"
        ;;

    6)
        echo ""
        echo " Arrêt des services..."

        # Arrêter les processus
        pkill -f "python.*app.py" && echo " Backend arrêté"
        pkill -f "vite" && echo " Frontend arrêté"

        echo " Nettoyage terminé"
        ;;

    *)
        echo "Option invalide"
        exit 1
        ;;
esac