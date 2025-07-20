# NutriPredict - Prédicteur de Nutri-Score

##  Description
Application web complète pour la prédiction et l'analyse du Nutri-Score des produits alimentaires utilisant l'intelligence artificielle.


##  Démarrage Rapide

### Démarrage Automatique (Recommandé)
```bash
# Démarrage interactif avec menu
./start_project.sh

# Ou directement :
./start_backend.sh      # Backend seulement
./start_frontend.sh     # Frontend seulement
./train_model.sh        # Entraînement IA
```

###  Démarrage Manuel

#### 1. Backend (API Flask)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### 2. Frontend (React)
```bash
cd frontend/nutriscore-frontend
npm install
npm run dev
```

#### 3. Entraînement IA
```bash
cd ia/scripts
python train_model.py
```

## Technologies Utilisées

- **Backend**: Flask, MongoDB, scikit-learn
- **Frontend**: React, Vite, CSS3
- **IA**: pandas, numpy, joblib
- **Base de données**: MongoDB

##  Fonctionnalités

- Prédiction automatique du Nutri-Score
-  Interface web responsive
-  API REST complète
-  Analyse nutritionnelle avancée
-  Recommandations personnalisées
-  Dashboard d'analytics

##  URLs

- **Frontend**: http://localhost:5174
- **Backend API**: http://127.0.0.1:5001
- **Documentation**: http://127.0.0.1:5001/api/health
