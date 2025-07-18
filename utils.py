
import requests

from config import Config, model_manager
from models import PredictionModel


def predict_nutriscore(nutrition_values, save_prediction=True, source="api", **kwargs):

    predicted_grade, probabilities = model_manager.predict(nutrition_values)

    if save_prediction:
        prediction_data = {
            "input_values": nutrition_values,
            "predicted_grade": predicted_grade,
            "probabilities": {
                "A": float(probabilities[0]),
                "B": float(probabilities[1]),
                "C": float(probabilities[2]),
                "D": float(probabilities[3]),
                "E": float(probabilities[4])
            },
            "source": source,
            **kwargs
        }

        PredictionModel.create(prediction_data)

    return predicted_grade, probabilities

def search_openfoodfacts(barcode):

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
    required_fields = ['energy', 'sugars', 'saturated_fat', 'salt', 'fiber', 'proteins', 'fruits_vegetables_nuts']
    errors = []

    # Vérification des champs requis
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        errors.append(f"Champs manquants: {missing_fields}")

    # Vérification des types et valeurs
    for field in required_fields:
        if field in data:
            try:
                value = float(data[field])
                if value < 0:
                    errors.append(f"{field} ne peut pas être négatif")
                elif field == 'fruits_vegetables_nuts' and value > 100:
                    errors.append(f"{field} ne peut pas dépasser 100%")
            except (ValueError, TypeError):
                errors.append(f"{field} doit être un nombre")

    return len(errors) == 0, errors

def format_product_response(product):

    if not product:
        return None

    # Assurer que _id est une string
    if '_id' in product:
        product['_id'] = str(product['_id'])

    return product

def create_nutriscore_object(predicted_grade, probabilities):
   
    return {
        "grade": predicted_grade,
        "probabilities": {
            "A": float(probabilities[0]),
            "B": float(probabilities[1]),
            "C": float(probabilities[2]),
            "D": float(probabilities[3]),
            "E": float(probabilities[4])
        }
    }