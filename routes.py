
from flask import jsonify, request

from models import PredictionModel, ProductModel, StatsModel
from utils import (create_nutriscore_object, format_product_response,
                   predict_nutriscore, search_openfoodfacts,
                   validate_nutrition_data)


def register_routes(app):


    @app.route('/api/health', methods=['GET'])
    def health_check():

        from config import model_manager, mongodb_manager

        return jsonify({
            "status": "OK",
            "message": "Backend Nutri-Score opérationnel",
            "model_loaded": model_manager.is_loaded,
            "mongodb_connected": mongodb_manager.client is not None
        })

    @app.route('/api/search-predict', methods=['POST'])
    def search_and_predict():
        """Recherche intelligente avec prédiction"""
        try:
            data = request.get_json()
            search_query = data.get('search', '').strip()

            if not search_query:
                return jsonify({"error": "Terme de recherche requis"}), 400

            # 1. Recherche dans la base locale
            products, total = ProductModel.search(search_query, limit=5)

            if products:
                return jsonify({
                    "found": True,
                    "message": f"{len(products)} produit(s) trouvé(s)",
                    "products": products,
                    "source": "database"
                }), 200

            # 2. Tentative de prédiction si données fournies
            required_fields = ['energy', 'sugars', 'saturated_fat', 'salt', 'fiber', 'proteins', 'fruits_vegetables_nuts']

            if all(field in data for field in required_fields):
                # Validation des données
                is_valid, errors = validate_nutrition_data(data)
                if not is_valid:
                    return jsonify({"error": "Données invalides", "details": errors}), 400

                # Prédiction
                nutrition_values = [data[field] for field in required_fields]
                predicted_grade, probabilities = predict_nutriscore(
                    nutrition_values,
                    save_prediction=True,
                    source="search_predict"
                )

                temp_product = {
                    "name": data.get('name', f"Produit recherché: {search_query}"),
                    "brand": data.get('brand', 'Marque inconnue'),
                    "category": data.get('category', 'Non spécifiée'),
                    "search_term": search_query,
                    "nutrition": dict(zip(required_fields, nutrition_values)),
                    "predicted_nutri_score": create_nutriscore_object(predicted_grade, probabilities),
                    "is_predicted": True
                }

                return jsonify({
                    "found": False,
                    "message": "Produit non trouvé - Prédiction effectuée",
                    "predicted_product": temp_product,
                    "suggestion": "Voulez-vous sauvegarder ce produit ?",
                    "source": "prediction"
                }), 200

            # 3. Données insuffisantes
            return jsonify({
                "found": False,
                "message": "Produit non trouvé et données nutritionnelles insuffisantes",
                "search_term": search_query,
                "required_fields": required_fields,
                "suggestion": "Fournissez les valeurs nutritionnelles pour une prédiction"
            }), 404

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/search-barcode/<barcode>', methods=['GET'])
    def search_by_barcode(barcode):
        """Recherche par code-barres"""
        try:
            # 1. Recherche locale
            product = ProductModel.find_by_barcode(barcode)
            if product:
                return jsonify({
                    "found": True,
                    "source": "local_database",
                    "product": format_product_response(product)
                }), 200

            # 2. Recherche OpenFoodFacts
            opff_product = search_openfoodfacts(barcode)
            if opff_product:
                # Prédiction avec notre modèle
                nutrition_values = list(opff_product['nutrition'].values())
                predicted_grade, probabilities = predict_nutriscore(
                    nutrition_values,
                    save_prediction=True,
                    source="openfoodfacts_barcode"
                )

                opff_product['predicted_nutri_score'] = create_nutriscore_object(predicted_grade, probabilities)

                return jsonify({
                    "found": True,
                    "source": "openfoodfacts",
                    "product": opff_product,
                    "message": "Produit trouvé sur OpenFoodFacts avec prédiction"
                }), 200

            # 3. Non trouvé
            return jsonify({
                "found": False,
                "barcode": barcode,
                "message": "Produit non trouvé localement ni sur OpenFoodFacts"
            }), 404

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/search', methods=['GET'])
    def simple_search():
        """Recherche simple par nom de produit avec filtres optionnels"""
        try:
            query = request.args.get('q', '').strip()
            nutri_score = request.args.get('nutri_score', '').strip()
            category = request.args.get('category', '').strip()
            brand = request.args.get('brand', '').strip()

            # Au moins un critère de recherche est requis
            if not (query or nutri_score or category or brand):
                return jsonify({"error": "Au moins un paramètre de recherche requis"}), 400

            # Recherche dans la base de données locale avec filtres
            products, total = ProductModel.search(
                query,
                nutri_score=nutri_score,
                category=category,
                brand=brand,
                limit=50
            )

            search_info = {
                "query": query,
                "filters": {
                    "nutri_score": nutri_score,
                    "category": category,
                    "brand": brand
                }
            }

            if products:
                return jsonify({
                    "found": True,
                    "total": total,
                    "search": search_info,
                    "products": [format_product_response(product) for product in products],
                    "message": f"{len(products)} produit(s) trouvé(s)"
                }), 200
            else:
                return jsonify({
                    "found": False,
                    "total": 0,
                    "search": search_info,
                    "products": [],
                    "message": "Aucun produit trouvé"
                }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/products', methods=['POST'])
    def create_product():
        """Créer un nouveau produit"""
        try:
            data = request.get_json()

            # Validation
            required_fields = ['name', 'energy', 'sugars', 'saturated_fat', 'salt', 'fiber', 'proteins', 'fruits_vegetables_nuts']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({"error": f"Champs manquants: {missing_fields}"}), 400

            is_valid, errors = validate_nutrition_data(data)
            if not is_valid:
                return jsonify({"error": "Données invalides", "details": errors}), 400

            # Prédiction
            nutrition_values = [data[field] for field in required_fields[1:]]
            predicted_grade, probabilities = predict_nutriscore(
                nutrition_values,
                save_prediction=True,
                source="product_creation"
            )

            # Ajout du Nutri-Score aux données
            data['nutri_score'] = create_nutriscore_object(predicted_grade, probabilities)

            # Création du produit
            product = ProductModel.create(data)

            return jsonify({
                "message": "Produit créé avec succès",
                "product": product,
                "nutri_score": predicted_grade
            }), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/products', methods=['GET'])
    def get_products():
        """Liste des produits avec pagination"""
        try:
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 10))
            search = request.args.get('search', '')

            products, total = ProductModel.search(search, page, limit)

            return jsonify({
                "products": products,
                "pagination": {
                    "current_page": page,
                    "total_pages": (total + limit - 1) // limit,
                    "total_products": total,
                    "per_page": limit
                }
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/products/<product_id>', methods=['GET'])
    def get_product(product_id):
        """Détails d'un produit"""
        try:
            product = ProductModel.find_by_id(product_id)
            if not product:
                return jsonify({"error": "Produit non trouvé"}), 404

            return jsonify(product), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/products/<product_id>', methods=['PUT'])
    def update_product(product_id):
        """Modifier un produit"""
        try:
            data = request.get_json()

            # Vérifier que le produit existe
            existing_product = ProductModel.find_by_id(product_id)
            if not existing_product:
                return jsonify({"error": "Produit non trouvé"}), 404

            # Validation des champs obligatoires si fournis
            if 'name' in data and not data['name'].strip():
                return jsonify({"error": "Le nom du produit ne peut pas être vide"}), 400

            # Si des valeurs nutritionnelles sont fournies, refaire la prédiction
            nutrition_fields = ['energy', 'sugars', 'saturated_fat', 'salt', 'fiber', 'proteins', 'fruits_vegetables_nuts']
            has_nutrition_data = all(field in data for field in nutrition_fields)

            if has_nutrition_data:
                # Validation des données nutritionnelles
                is_valid, errors = validate_nutrition_data(data)
                if not is_valid:
                    return jsonify({"error": "Données invalides", "details": errors}), 400

                # Nouvelle prédiction
                nutrition_values = [data[field] for field in nutrition_fields]
                predicted_grade, probabilities = predict_nutriscore(
                    nutrition_values,
                    save_prediction=True,
                    source="product_update"
                )

                # Restructurer les données nutritionnelles dans l'objet nutrition
                data['nutrition'] = {
                    "energy": data['energy'],
                    "sugars": data['sugars'],
                    "saturated_fat": data['saturated_fat'],
                    "salt": data['salt'],
                    "fiber": data['fiber'],
                    "proteins": data['proteins'],
                    "fruits_vegetables_nuts": data['fruits_vegetables_nuts']
                }

                # Supprimer les champs nutritionnels du niveau racine
                for field in nutrition_fields:
                    data.pop(field, None)

                # Ajouter le nouveau Nutri-Score aux données
                data['nutri_score'] = create_nutriscore_object(predicted_grade, probabilities)

            # Mettre à jour le produit
            if ProductModel.update(product_id, data):
                # Récupérer le produit mis à jour
                updated_product = ProductModel.find_by_id(product_id)

                return jsonify({
                    "message": "Produit modifié avec succès",
                    "product": updated_product,
                    "nutri_score": data.get('nutri_score', {}).get('grade') if 'nutri_score' in data else None
                }), 200
            else:
                return jsonify({"error": "Échec de la modification"}), 500

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/products/<product_id>', methods=['DELETE'])
    def delete_product(product_id):
        """Supprimer un produit"""
        try:
            if ProductModel.delete(product_id):
                return jsonify({"message": "Produit supprimé avec succès"}), 200
            else:
                return jsonify({"error": "Produit non trouvé"}), 404

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/predictions', methods=['GET'])
    def get_predictions():
        """Historique des prédictions"""
        try:
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 20))

            predictions, total = PredictionModel.get_history(page, limit)

            return jsonify({
                "predictions": predictions,
                "pagination": {
                    "current_page": page,
                    "total_pages": (total + limit - 1) // limit,
                    "total_predictions": total,
                    "per_page": limit
                }
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/stats', methods=['GET'])
    def get_statistics():
        """Statistiques de l'application"""
        try:
            stats = StatsModel.get_dashboard_stats()
            return jsonify(stats), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/predict', methods=['POST'])
    def predict_direct():
        """Prédiction directe sans sauvegarde de produit"""
        try:
            data = request.get_json()

            required_fields = ['energy', 'sugars', 'saturated_fat', 'salt', 'fiber', 'proteins', 'fruits_vegetables_nuts']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({"error": f"Champs manquants: {missing_fields}"}), 400

            is_valid, errors = validate_nutrition_data(data)
            if not is_valid:
                return jsonify({"error": "Données invalides", "details": errors}), 400

            nutrition_values = [data[field] for field in required_fields]
            predicted_grade, probabilities = predict_nutriscore(
                nutrition_values,
                save_prediction=True,
                source="direct_prediction"
            )

            return jsonify({
                "nutri_score": predicted_grade,
                "probabilities": create_nutriscore_object(predicted_grade, probabilities)["probabilities"],
                "input_values": dict(zip(required_fields, nutrition_values))
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500