
import re
import unicodedata
from datetime import datetime

import requests

from config import Config, mongodb_manager


def normalize_search_text(text):
    """Normalise le texte pour la recherche en supprimant les accents et en unifiant la casse"""
    if not text:
        return ""

    normalized = unicodedata.normalize('NFD', text)
    # Supprimer les caractères de combinaison (accents)
    without_accents = ''.join(char for char in normalized
                             if unicodedata.category(char) != 'Mn')
   
    cleaned = re.sub(r'\s+', ' ', without_accents.lower().strip())

    return cleaned


def update_existing_products_search_fields():
    """Met à jour tous les produits existants avec les champs de recherche normalisés"""
    collection = mongodb_manager.get_collection('products')

    # Récupérer tous les produits
    products = collection.find({})
    updated_count = 0

    for product in products:
        # Préparer les champs de recherche normalisés
        search_fields = {
            'search_name': normalize_search_text(product.get('name', '')),
            'search_brand': normalize_search_text(product.get('brand', '')),
            'search_category': normalize_search_text(product.get('category', ''))
        }

        # Mettre à jour le produit
        result = collection.update_one(
            {"_id": product['_id']},
            {"$set": search_fields}
        )

        if result.modified_count > 0:
            updated_count += 1

    print(f"Mis à jour {updated_count} produits avec les champs de recherche normalisés")
    return updated_count


def search_openfoodfacts(barcode):
    """Recherche un produit sur OpenFoodFacts par code-barres"""
    try:
        url = f"{Config.OPENFOODFACTS_API}/{barcode}.json"
        response = requests.get(url, timeout=Config.REQUEST_TIMEOUT)
        data = response.json()

        if data.get('status') == 1:
            product_data = data['product']
            nutriments = product_data.get('nutriments', {})

            # Extraction des données nutritionnelles
            nutrition_data = {
                "energy": nutriments.get('energy_100g', 0),
                "sugars": nutriments.get('sugars_100g', 0),
                "saturated_fat": nutriments.get('saturated-fat_100g', 0),
                "salt": nutriments.get('salt_100g', 0),
                "fiber": nutriments.get('fiber_100g', 0),
                "proteins": nutriments.get('proteins_100g', 0),
                "fruits_vegetables_nuts": nutriments.get('fruits-vegetables-nuts_100g', 0)
            }

            return {
                "name": product_data.get('product_name', 'Produit sans nom'),
                "brand": product_data.get('brands', ''),
                "category": product_data.get('categories', ''),
                "ingredients": product_data.get('ingredients_text', ''),
                "barcode": barcode,
                "nutrition": nutrition_data,
                "openfoodfacts_grade": product_data.get('nutrition_grades', 'non disponible'),
                "source": "openfoodfacts"
            }

    except Exception as e:
        print(f"Erreur OpenFoodFacts: {e}")

    return None


def validate_nutrition_data(data):
    """Valide les données nutritionnelles"""
    errors = []

    required_fields = ['energy', 'sugars', 'saturated_fat', 'salt', 'fiber', 'proteins', 'fruits_vegetables_nuts']

    for field in required_fields:
        if field not in data:
            errors.append(f"Champ manquant: {field}")
            continue

        try:
            value = float(data[field])
            if value < 0:
                errors.append(f"{field}: ne peut pas être négatif")
            if field == 'energy' and value > 10000:
                errors.append(f"{field}: valeur trop élevée (max 10000 kJ)")
            if field != 'energy' and value > 100:
                errors.append(f"{field}: valeur trop élevée (max 100g)")
        except (ValueError, TypeError):
            errors.append(f"{field}: doit être un nombre")

    return len(errors) == 0, errors


def create_nutriscore_object(grade, probabilities):
    """Crée un objet Nutri-Score formaté"""
    # Convertir le numpy array en liste pour MongoDB
    if hasattr(probabilities, 'tolist'):
        probabilities = probabilities.tolist()

    return {
        "grade": grade,
        "probabilities": probabilities
    }


def format_product_response(product):
    """Formate la réponse produit pour l'API"""
    if not product:
        return None

    # S'assurer que l'ID est une string
    if '_id' in product:
        product['_id'] = str(product['_id'])

    return product


def predict_nutriscore(nutrition_values, save_prediction=False, source="unknown"):
    """Prédiction du Nutri-Score avec le modèle ML"""
    try:
        from config import model_manager

        if not model_manager.is_loaded:
            raise Exception("Modèle ML non chargé")

        # Prédiction
        grade, probabilities = model_manager.predict(nutrition_values)

        # Sauvegarde optionnelle de la prédiction
        if save_prediction:
            save_prediction_to_db(nutrition_values, grade, probabilities, source)

        return grade, probabilities

    except Exception as e:
        print(f"Erreur prédiction: {e}")
        # Retour par défaut
        return "C", {"A": 0.2, "B": 0.2, "C": 0.2, "D": 0.2, "E": 0.2}


def save_prediction_to_db(nutrition_values, predicted_grade, probabilities, source):
    """Sauvegarde une prédiction dans la base de données"""
    try:
        from datetime import datetime

        from config import mongodb_manager

        collection = mongodb_manager.get_collection('predictions')

        # Convertir le numpy array en liste pour MongoDB
        if hasattr(probabilities, 'tolist'):
            probabilities = probabilities.tolist()

        prediction = {
            "nutrition_values": nutrition_values,
            "predicted_grade": predicted_grade,
            "probabilities": probabilities,
            "source": source,
            "created_at": datetime.now()
        }

        collection.insert_one(prediction)

    except Exception as e:
        print(f"Erreur sauvegarde prédiction: {e}")


def get_better_nutri_grades(current_grade):
    """Retourne les grades Nutri-Score meilleurs que le grade actuel"""
    grade_order = ['A', 'B', 'C', 'D', 'E']

    if current_grade not in grade_order:
        return ['A', 'B']

    current_index = grade_order.index(current_grade)
    return grade_order[:current_index] if current_index > 0 else []