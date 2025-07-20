#  Backend - API NutriPredict

##  Description
API Flask pour la prédiction du Nutri-Score et la gestion des produits alimentaires.


## Installation & Démarrage

```bash
# Installation des dépendances
pip install -r requirements.txt

# Démarrage du serveur
python app.py
```

Le serveur démarre sur `http://127.0.0.1:5001`

## Endpoints API

###  Santé
- `GET /api/health` - Status de l'API

###  Produits
- `GET /api/products` - Liste des produits (pagination)
- `POST /api/products` - Créer un produit
- `GET /api/products/{id}` - Détail d'un produit
- `PUT /api/products/{id}` - Modifier un produit
- `DELETE /api/products/{id}` - Supprimer un produit

### Recherche
- `GET /api/search?q={query}` - Recherche de produits
- `POST /api/search-predict` - Recherche intelligente avec prédiction

###  Prédictions
- `GET /api/predictions` - Historique des prédictions
- `POST /api/predict` - Prédiction manuelle du Nutri-Score

### Analytics
- `GET /api/stats` - Statistiques générales
- `GET /api/analytics` - Données d'analyse avancées
- `GET /api/nutrition-analysis` - Analyse nutritionnelle
- `GET /api/nutrition-advice/{grade}` - Conseils nutritionnels

### Recommandations
- `GET /api/products/{id}/recommendations` - Produits similaires

## Base de Données

### Collections MongoDB
- `products` - Produits alimentaires
- `predictions` - Historique des prédictions ML
- `analytics` - Données d'analyse

### Modèle Produit
```json
{
  "_id": "ObjectId",
  "name": "Nom du produit",
  "brand": "Marque",
  "category": "Catégorie",
  "nutrition": {
    "energy": 250,
    "sugars": 5.2,
    "saturated_fat": 1.8,
    "salt": 0.9,
    "fiber": 3.1,
    "proteins": 8.4,
    "fruits_vegetables_nuts": 15
  },
  "nutri_score": {
    "grade": "B",
    "probabilities": [0.1, 0.7, 0.15, 0.04, 0.01]
  },
  "created_at": "2024-07-20T10:30:00Z",
  "updated_at": "2024-07-20T10:30:00Z"
}
```

##  Intelligence Artificielle

### Modèles Utilisés
- **RandomForestClassifier** - Classification Nutri-Score
- **StandardScaler** - Normalisation des données
- **OrdinalEncoder** - Encodage des catégories

### Prédiction Automatique
-  Déclenchée lors de la création/modification de produits
-  Sauvegarde automatique dans l'historique
-  Calcul des probabilités pour chaque grade (A-E)

##  Configuration

### Variables d'Environnement
```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB=nutriscore_webapp
ML_MODEL_PATH=../ia/models/
```

### Développement
```bash
# Mode debug
export FLASK_ENV=development
python app.py
```

## Performance
- Pagination optimisée
- Indexation MongoDB
- Cache des prédictions ML
- Requêtes asynchrones