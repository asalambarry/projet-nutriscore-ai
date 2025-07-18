"""
Modèles de données pour l'application Nutri-Score
"""

from datetime import datetime

from bson.objectid import ObjectId

from config import mongodb_manager


class ProductModel:
    """Modèle pour les produits alimentaires"""

    @staticmethod
    def create(data):
        """Crée un nouveau produit"""
        product = {
            "name": data['name'],
            "brand": data.get('brand', ''),
            "category": data.get('category', ''),
            "ingredients": data.get('ingredients', ''),
            "barcode": data.get('barcode', ''),
            "nutrition": {
                "energy": data['energy'],
                "sugars": data['sugars'],
                "saturated_fat": data['saturated_fat'],
                "salt": data['salt'],
                "fiber": data['fiber'],
                "proteins": data['proteins'],
                "fruits_vegetables_nuts": data['fruits_vegetables_nuts']
            },
            "nutri_score": data['nutri_score'],
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "source": data.get('source', 'user_input')
        }

        collection = mongodb_manager.get_collection('products')
        result = collection.insert_one(product)
        product['_id'] = str(result.inserted_id)

        return product

    @staticmethod
    def find_by_id(product_id):
        """Trouve un produit par ID"""
        collection = mongodb_manager.get_collection('products')
        product = collection.find_one({"_id": ObjectId(product_id)})

        if product:
            product['_id'] = str(product['_id'])

        return product

    @staticmethod
    def search(query, page=1, limit=10, nutri_score='', category='', brand=''):
        """Recherche de produits avec filtres optionnels"""
        collection = mongodb_manager.get_collection('products')

        # Construction de la requête de recherche
        search_conditions = []

        # Recherche textuelle sur nom, marque, catégorie et code-barre
        if query:
            search_conditions.append({
                "$or": [
                    {"name": {"$regex": query, "$options": "i"}},
                    {"brand": {"$regex": query, "$options": "i"}},
                    {"category": {"$regex": query, "$options": "i"}},
                    {"barcode": query}
                ]
            })

        # Filtre par Nutri-Score
        if nutri_score:
            search_conditions.append({"nutri_score.grade": nutri_score.upper()})

        # Filtre par catégorie
        if category:
            search_conditions.append({"category": {"$regex": category, "$options": "i"}})

        # Filtre par marque
        if brand:
            search_conditions.append({"brand": {"$regex": brand, "$options": "i"}})

        # Construction de la requête finale
        if search_conditions:
            if len(search_conditions) == 1:
                search_query = search_conditions[0]
            else:
                search_query = {"$and": search_conditions}
        else:
            search_query = {}

        skip = (page - 1) * limit
        products = list(collection.find(search_query).skip(skip).limit(limit).sort("created_at", -1))
        total = collection.count_documents(search_query)

        for product in products:
            product['_id'] = str(product['_id'])

        return products, total

    @staticmethod
    def update(product_id, data):
        """Met à jour un produit"""
        collection = mongodb_manager.get_collection('products')

        update_data = {
            "updated_at": datetime.now(),
            **{k: v for k, v in data.items() if k != '_id'}
        }

        result = collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )

        return result.modified_count > 0

    @staticmethod
    def delete(product_id):
        """Supprime un produit"""
        collection = mongodb_manager.get_collection('products')
        result = collection.delete_one({"_id": ObjectId(product_id)})
        return result.deleted_count > 0

    @staticmethod
    def find_by_barcode(barcode):
        """Trouve un produit par code-barres"""
        collection = mongodb_manager.get_collection('products')
        product = collection.find_one({"barcode": barcode})

        if product:
            product['_id'] = str(product['_id'])

        return product

class PredictionModel:
    """Modèle pour les prédictions"""

    @staticmethod
    def create(data):
        """Sauvegarde une prédiction"""
        prediction = {
            "product_id": data.get('product_id'),
            "input_values": data['input_values'],
            "predicted_grade": data['predicted_grade'],
            "probabilities": data['probabilities'],
            "prediction_date": datetime.now(),
            "source": data.get('source', 'api'),
            "user_id": data.get('user_id')
        }

        collection = mongodb_manager.get_collection('predictions')
        result = collection.insert_one(prediction)
        prediction['_id'] = str(result.inserted_id)

        return prediction

    @staticmethod
    def get_history(page=1, limit=20):
        """Récupère l'historique des prédictions"""
        collection = mongodb_manager.get_collection('predictions')

        skip = (page - 1) * limit
        predictions = list(collection.find().skip(skip).limit(limit).sort("prediction_date", -1))
        total = collection.count_documents({})

        for prediction in predictions:
            prediction['_id'] = str(prediction['_id'])
            if 'product_id' in prediction and prediction['product_id']:
                prediction['product_id'] = str(prediction['product_id'])

        return predictions, total

class StatsModel:
    """Modèle pour les statistiques"""

    @staticmethod
    def get_dashboard_stats():
        """Statistiques pour le dashboard"""
        products_collection = mongodb_manager.get_collection('products')
        predictions_collection = mongodb_manager.get_collection('predictions')

        # Statistiques de base
        total_products = products_collection.count_documents({})
        total_predictions = predictions_collection.count_documents({})

        # Répartition Nutri-Score
        nutri_scores = list(products_collection.aggregate([
            {"$group": {"_id": "$nutri_score.grade", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]))

        # Produits récents
        recent_products = list(products_collection.find().sort("created_at", -1).limit(5))
        for product in recent_products:
            product['_id'] = str(product['_id'])

        return {
            "total_products": total_products,
            "total_predictions": total_predictions,
            "nutri_score_distribution": nutri_scores,
            "recent_products": recent_products
        }