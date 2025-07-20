
import re
import unicodedata
from datetime import datetime

from bson.objectid import ObjectId

from config import mongodb_manager


def normalize_search_text(text):
    """Normalise le texte pour la recherche en supprimant les accents et en unifiant la casse"""
    if not text:
        return ""

    # Normaliser les accents (NFD = décomposition canonique)
    normalized = unicodedata.normalize('NFD', text)
    # Supprimer les caractères de combinaison (accents)
    without_accents = ''.join(char for char in normalized
                             if unicodedata.category(char) != 'Mn')
    # Convertir en minuscules et supprimer les espaces multiples
    cleaned = re.sub(r'\s+', ' ', without_accents.lower().strip())

    return cleaned


class ProductModel:
   

    @staticmethod
    def create(data):
        """Crée un nouveau produit"""
        product = {
            "name": data['name'],
            "brand": data.get('brand', ''),
            "category": data.get('category', ''),
            "ingredients": data.get('ingredients', ''),
            "barcode": data.get('barcode', ''),
            # Ajouter des champs normalisés pour la recherche
            "search_name": normalize_search_text(data['name']),
            "search_brand": normalize_search_text(data.get('brand', '')),
            "search_category": normalize_search_text(data.get('category', '')),
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
        """Recherche simple avec normalisation des accents"""
        collection = mongodb_manager.get_collection('products')

        # Construction de la requête de recherche
        search_conditions = []

        # Recherche textuelle avec normalisation simple des accents
        if query:
            # Normaliser la requête (supprimer les accents)
            normalized_query = normalize_search_text(query)

            search_conditions.append({
                "$or": [
                    # Recherche classique
                    {"name": {"$regex": query, "$options": "i"}},
                    {"brand": {"$regex": query, "$options": "i"}},
                    {"category": {"$regex": query, "$options": "i"}},
                    {"ingredients": {"$regex": query, "$options": "i"}},
                    {"barcode": query},
                    # Recherche normalisée (sans accents)
                    {"search_name": {"$regex": normalized_query, "$options": "i"}},
                    {"search_brand": {"$regex": normalized_query, "$options": "i"}},
                    {"search_category": {"$regex": normalized_query, "$options": "i"}}
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
        """Met à jour un produit avec mise à jour des champs de recherche"""
        collection = mongodb_manager.get_collection('products')

        update_data = {
            "updated_at": datetime.now(),
            **{k: v for k, v in data.items() if k != '_id'}
        }

        # Mettre à jour les champs de recherche normalisés si nécessaire
        if 'name' in data:
            update_data['search_name'] = normalize_search_text(data['name'])
        if 'brand' in data:
            update_data['search_brand'] = normalize_search_text(data['brand'])
        if 'category' in data:
            update_data['search_category'] = normalize_search_text(data['category'])

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

    @staticmethod
    def get_by_id(product_id):
        """Récupère un produit par son ID"""
        collection = mongodb_manager.get_collection('products')
        product = collection.find_one({"_id": ObjectId(product_id)})

        if product:
            product['_id'] = str(product['_id'])

        return product

    @staticmethod
    def find_alternatives(category=None, better_grades=None, exclude_id=None, limit=5):
        """Trouve des produits alternatifs avec de meilleurs Nutri-Scores"""
        collection = mongodb_manager.get_collection('products')

        # Construction de la requête
        query = {}

        # Filtrer par catégorie si spécifiée
        if category:
            query['category'] = {'$regex': category, '$options': 'i'}

        # Filtrer par meilleurs grades
        if better_grades:
            query['nutri_score.grade'] = {'$in': better_grades}

        # Exclure le produit actuel
        if exclude_id:
            query['_id'] = {'$ne': ObjectId(exclude_id)}

        # Recherche avec tri par grade (A > B > C > D > E)
        products = list(collection.find(query).limit(limit))

        # Tri personnalisé par grade
        grade_order = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4}
        products.sort(key=lambda x: grade_order.get(x.get('nutri_score', {}).get('grade', 'E'), 4))

        # Formater les résultats
        alternatives = []
        for product in products:
            alternatives.append({
                'id': str(product['_id']),
                'name': product.get('name', ''),
                'brand': product.get('brand', ''),
                'category': product.get('category', ''),
                'nutri_score': product.get('nutri_score', {}),
                'created_at': product.get('created_at')
            })

        return alternatives

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

    @staticmethod
    def get_detailed_analytics():
        """Analyses détaillées pour les dashboards"""
        products_collection = mongodb_manager.get_collection('products')

        # Récupérer tous les produits
        products = list(products_collection.find())

        # 1. Répartition détaillée des Nutri-Scores
        nutri_distribution = {}
        energy_by_grade = {"A": [], "B": [], "C": [], "D": [], "E": []}

        # 2. Statistiques nutritionnelles par grade
        nutrition_stats = {"A": {}, "B": {}, "C": {}, "D": {}, "E": {}}
        nutrients = ['energy', 'sugars', 'saturated_fat', 'salt', 'fiber', 'proteins', 'fruits_vegetables_nuts']

        # 3. Corrélations entre nutriments
        nutrition_values = {nutrient: [] for nutrient in nutrients}

        # 4. Top marques et catégories
        brands_count = {}
        categories_count = {}

        for product in products:
            grade = product.get('nutri_score', {}).get('grade', 'N/A')
            # Normaliser le grade (majuscule et vérifier qu'il est valide)
            if isinstance(grade, str):
                grade = grade.upper()
            if grade not in ['A', 'B', 'C', 'D', 'E']:
                grade = 'N/A'

            nutrition = product.get('nutrition', {})

            # Distribution Nutri-Score
            nutri_distribution[grade] = nutri_distribution.get(grade, 0) + 1

            # Énergie par grade pour les boxplots
            if grade in energy_by_grade and nutrition.get('energy'):
                try:
                    energy_value = float(nutrition.get('energy', 0))
                    if energy_value >= 0:  # Valeur valide
                        energy_by_grade[grade].append(energy_value)
                except (ValueError, TypeError):
                    pass  # Ignorer les valeurs non numériques

            # Valeurs nutritionnelles pour corrélations
            for nutrient in nutrients:
                value = nutrition.get(nutrient)
                if value is not None:
                    try:
                        num_value = float(value)
                        if num_value >= 0:  # Valeur valide
                            nutrition_values[nutrient].append(num_value)
                    except (ValueError, TypeError):
                        pass  # Ignorer les valeurs non numériques

            # Marques
            brand = product.get('brand', '')
            if isinstance(brand, str) and brand.strip():
                brands_count[brand.strip()] = brands_count.get(brand.strip(), 0) + 1

            # Catégories
            category = product.get('category', '')
            if isinstance(category, str) and category.strip():
                categories_count[category.strip()] = categories_count.get(category.strip(), 0) + 1

        # Calcul des corrélations simples
        correlations = StatsModel._calculate_correlations(nutrition_values)

        # Statistiques descriptives par nutriment
        descriptive_stats = {}
        for nutrient in nutrients:
            values = nutrition_values[nutrient]
            if values:
                descriptive_stats[nutrient] = {
                    'mean': sum(values) / len(values),
                    'min': min(values),
                    'max': max(values),
                    'count': len(values)
                }

        return {
            "nutri_score_distribution": nutri_distribution,
            "energy_by_grade": energy_by_grade,
            "correlations": correlations,
            "top_brands": dict(sorted(brands_count.items(), key=lambda x: x[1], reverse=True)[:10]),
            "top_categories": dict(sorted(categories_count.items(), key=lambda x: x[1], reverse=True)[:10]),
            "nutrition_descriptive": descriptive_stats,
            "total_analyzed": len(products)
        }

    @staticmethod
    def _calculate_correlations(nutrition_values):
        """Calcule les corrélations entre nutriments"""
        correlations = {}
        nutrients = list(nutrition_values.keys())

        for i, nutrient1 in enumerate(nutrients):
            correlations[nutrient1] = {}
            for j, nutrient2 in enumerate(nutrients):
                if i <= j:  # Éviter les doublons
                    values1 = nutrition_values[nutrient1]
                    values2 = nutrition_values[nutrient2]

                    if len(values1) > 1 and len(values2) > 1:
                        # Corrélation de Pearson simplifiée
                        if len(values1) == len(values2):
                            corr = StatsModel._pearson_correlation(values1, values2)
                            correlations[nutrient1][nutrient2] = round(corr, 3)
                        else:
                            correlations[nutrient1][nutrient2] = 0
                    else:
                        correlations[nutrient1][nutrient2] = 0

        return correlations

    @staticmethod
    def _pearson_correlation(x, y):
        """Calcul de corrélation de Pearson"""
        if len(x) != len(y) or len(x) < 2:
            return 0

        n = len(x)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_x2 = sum(xi * xi for xi in x)
        sum_y2 = sum(yi * yi for yi in y)
        sum_xy = sum(xi * yi for xi, yi in zip(x, y))

        denominator = ((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y)) ** 0.5
        if denominator == 0:
            return 0

        return (n * sum_xy - sum_x * sum_y) / denominator

    @staticmethod
    def get_nutrition_analysis():
        """Analyse approfondie des données nutritionnelles"""
        products_collection = mongodb_manager.get_collection('products')

        # Récupérer tous les produits avec leurs données nutritionnelles
        products = list(products_collection.find({"nutrition": {"$exists": True}}))

        nutrients = ['energy', 'sugars', 'saturated_fat', 'salt', 'fiber', 'proteins', 'fruits_vegetables_nuts']

        # Distributions par nutriment
        distributions = {}
        for nutrient in nutrients:
            values = []
            for product in products:
                value = product.get('nutrition', {}).get(nutrient)
                if value is not None:
                    try:
                        num_value = float(value)
                        if num_value >= 0:  # Exclure les valeurs négatives
                            values.append(num_value)
                    except (ValueError, TypeError):
                        pass  # Ignorer les valeurs non numériques

            if values:
                # Créer des bins pour histogrammes
                min_val = min(values)
                max_val = max(values)

                # Créer 10 bins
                bins = []
                bin_size = (max_val - min_val) / 10 if max_val > min_val else 1

                for i in range(10):
                    bin_start = min_val + i * bin_size
                    bin_end = min_val + (i + 1) * bin_size
                    count = len([v for v in values if bin_start <= v < bin_end])
                    bins.append({
                        'range': f"{bin_start:.1f}-{bin_end:.1f}",
                        'count': count,
                        'start': bin_start,
                        'end': bin_end
                    })

                distributions[nutrient] = {
                    'bins': bins,
                    'total_values': len(values),
                    'min': min_val,
                    'max': max_val,
                    'avg': sum(values) / len(values)
                }

        return distributions