"""
Application Flask principale pour le backend Nutri-Score
Point d'entrée de l'application
"""

from flask import Flask
from flask_cors import CORS

from config import Config, initialize_app, mongodb_manager
from routes import register_routes


def create_app():
    """Factory pour créer l'application Flask"""

    # Création de l'application Flask
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configuration CORS pour permettre les requêtes frontend
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000", "http://127.0.0.1:3000",
                "http://localhost:5173", "http://127.0.0.1:5173",
                "http://localhost:5174", "http://127.0.0.1:5174",
                "http://localhost:5175", "http://127.0.0.1:5175"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Initialisation des composants (MongoDB, Modèle ML)
    if not initialize_app():
        print("Échec de l'initialisation")
        return None

    # Enregistrement des routes
    register_routes(app)

    # Gestionnaire d'erreur global
    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Endpoint non trouvé"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Erreur interne du serveur"}, 500

    return app

def main():
    """Point d'entrée principal"""

    print("BACKEND NUTRI-SCORE")
    print("=" * 40)

    # Création de l'application
    app = create_app()
    if not app:
        print("Impossible de créer l'application")
        return

    # Affichage des informations
    config = Config()
    print(f"Serveur: http://{config.HOST}:{config.PORT}")
    print(f"MongoDB: {config.DATABASE_NAME}")
    print(f"Documentation API: /api/health")
    # print(f"Mode debug: {'Activé' if config.DEBUG else 'Désactivé'}")

    try:
        # Démarrage du serveur
        app.run(
            host=config.HOST,
            port=config.PORT,
            debug=config.DEBUG
        )
    except KeyboardInterrupt:
        print("\nArrêt du serveur...")
    finally:
        # Nettoyage
        mongodb_manager.close()

if __name__ == '__main__':
    main()