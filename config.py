"""
Configuration de l'application Nutri-Score
Séparation MongoDB et paramètres généraux
"""

import os
from datetime import datetime

import joblib
from pymongo import MongoClient


class Config:
    """Configuration générale de l'application"""

    # Configuration Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'nutriscore-secret-key-2024'
    DEBUG = os.environ.get('FLASK_DEBUG') or True

    # Configuration serveur
    HOST = os.environ.get('FLASK_HOST') or '127.0.0.1'
    PORT = int(os.environ.get('FLASK_PORT') or 5001)

    # Configuration MongoDB
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb://localhost:27017/'
    DATABASE_NAME = os.environ.get('DATABASE_NAME') or 'nutriscore_webapp'

    # Configuration modèle ML
    MODEL_PATH = os.environ.get('MODEL_PATH') or 'saved_models/'
    MODEL_FILES = {
        'model': 'nutriscore_model.joblib',
        'scaler': 'nutriscore_scaler.joblib',
        'encoder': 'nutriscore_encoder.joblib'
    }

    # Configuration API externe
    OPENFOODFACTS_API = 'https://world.openfoodfacts.org/api/v0/product'
    REQUEST_TIMEOUT = 5

class MongoDBManager:
    """Gestionnaire de connexion MongoDB"""

    def __init__(self, config=None):
        self.config = config or Config()
        self.client = None
        self.database = None
        self.collections = {}

    def connect(self):
        """Établit la connexion MongoDB"""
        try:
            self.client = MongoClient(self.config.MONGO_URI)
            # Test de connexion
            self.client.admin.command('ismaster')
            self.database = self.client[self.config.DATABASE_NAME]

            # Initialisation des collections
            self._setup_collections()

            print(f"MongoDB connecté: {self.config.DATABASE_NAME}")
            return True

        except Exception as e:
            print(f"Erreur connexion MongoDB: {e}")
            return False

    def _setup_collections(self):
        """Configure les collections MongoDB"""
        self.collections = {
            'products': self.database.products,
            'predictions': self.database.predictions,
            'users': self.database.users,
            'stats': self.database.stats
        }

        # Index pour optimiser les recherches
        self.collections['products'].create_index([
            ('name', 'text'),
            ('brand', 'text'),
            ('category', 'text')
        ])
        self.collections['products'].create_index('barcode')
        self.collections['products'].create_index('created_at')

    def get_collection(self, name):
        """Récupère une collection par nom"""
        return self.collections.get(name)

    def close(self):
        """Ferme la connexion MongoDB"""
        if self.client:
            self.client.close()
            print("Connexion MongoDB fermée")

class ModelManager:
    """Gestionnaire du modèle de Machine Learning"""

    def __init__(self, config=None):
        self.config = config or Config()
        self.model = None
        self.scaler = None
        self.encoder = None
        self.is_loaded = False

    def load_model(self):
        """Charge le modèle ML"""
        try:
            model_path = self.config.MODEL_PATH

            self.model = joblib.load(f"{model_path}{self.config.MODEL_FILES['model']}")
            self.scaler = joblib.load(f"{model_path}{self.config.MODEL_FILES['scaler']}")
            self.encoder = joblib.load(f"{model_path}{self.config.MODEL_FILES['encoder']}")

            self.is_loaded = True
            print("Modèle ML chargé avec succès")
            return True

        except Exception as e:
            print(f"Erreur chargement modèle: {e}")
            print("Mode simulation activé")
            self.is_loaded = False
            return False

    def predict(self, nutrition_values):
        """Effectue une prédiction"""
        if not self.is_loaded:
            # Mode simulation
            return "C", [0.1, 0.2, 0.4, 0.2, 0.1]

        try:
            import pandas as pd

            features = ['energy', 'sugars', 'saturated_fat', 'salt', 'fiber', 'proteins', 'fruits_vegetables_nuts']
            input_data = pd.DataFrame([nutrition_values], columns=features)

            input_scaled = self.scaler.transform(input_data)
            prediction = self.model.predict(input_scaled)
            probabilities = self.model.predict_proba(input_scaled)

            predicted_grade = chr(65 + int(prediction[0]))
            return predicted_grade, probabilities[0]

        except Exception as e:
            print(f"Erreur prédiction: {e}")
            return "C", [0.2, 0.2, 0.2, 0.2, 0.2]

# Instances globales
mongodb_manager = MongoDBManager()
model_manager = ModelManager()

def initialize_app():
    """Initialise tous les composants de l'application"""
    print("Initialisation de l'application Nutri-Score")

    # Connexion MongoDB
    if not mongodb_manager.connect():
        print("Échec connexion MongoDB")
        return False

    # Chargement modèle ML
    model_manager.load_model()

    print("Application initialisée avec succès")
    return True