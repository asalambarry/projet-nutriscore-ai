
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

            # Gestion du Nutri-Score
            if 'nutri_score' in data and data['nutri_score']:
                # Utiliser le Nutri-Score fourni
                if isinstance(data['nutri_score'], dict) and 'grade' in data['nutri_score']:
                    # Format complet déjà fourni
                    nutri_score_data = data['nutri_score']
                elif isinstance(data['nutri_score'], str):
                    # Juste la lettre fournie, créer l'objet complet
                    grade = data['nutri_score'].upper()
                    nutri_score_data = create_nutriscore_object(grade, {grade: 1.0})
                else:
                    # Format invalide, faire la prédiction
                    nutrition_values = [data[field] for field in required_fields[1:]]
                    predicted_grade, probabilities = predict_nutriscore(
                        nutrition_values,
                        save_prediction=True,
                        source="product_creation"
                    )
                    nutri_score_data = create_nutriscore_object(predicted_grade, probabilities)
                data['nutri_score'] = nutri_score_data
            else:
                # Aucun Nutri-Score fourni, faire la prédiction
                nutrition_values = [data[field] for field in required_fields[1:]]
                predicted_grade, probabilities = predict_nutriscore(
                    nutrition_values,
                    save_prediction=True,
                    source="product_creation"
                )
                data['nutri_score'] = create_nutriscore_object(predicted_grade, probabilities)

            # Création du produit
            product = ProductModel.create(data)

            return jsonify({
                "message": "Produit créé avec succès",
                "product": product,
                "nutri_score": data['nutri_score']['grade']
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

            # Vérifier si au moins un champ nutritionnel est fourni
            nutrition_fields_provided = [field for field in nutrition_fields if field in data]
            has_nutrition_data = len(nutrition_fields_provided) > 0

            # Si des champs nutritionnels sont fournis mais pas tous, on garde les anciennes valeurs
            if has_nutrition_data:
                # Compléter avec les valeurs existantes si nécessaire
                nutrition_data = {}
                for field in nutrition_fields:
                    if field in data:
                        nutrition_data[field] = data[field]
                    else:
                        # Prendre la valeur existante
                        nutrition_data[field] = existing_product.get('nutrition', {}).get(field, 0)

                # Validation des données nutritionnelles complètes
                is_valid, errors = validate_nutrition_data(nutrition_data)
                if not is_valid:
                    return jsonify({"error": "Données invalides", "details": errors}), 400

                # Nouvelle prédiction avec les données complètes
                nutrition_values = [nutrition_data[field] for field in nutrition_fields]
                predicted_grade, probabilities = predict_nutriscore(
                    nutrition_values,
                    save_prediction=True,
                    source="product_update"
                )

                # Restructurer les données nutritionnelles dans l'objet nutrition
                data['nutrition'] = nutrition_data

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

    @app.route('/api/analytics', methods=['GET'])
    def get_analytics():
        """Analyses détaillées pour les dashboards"""
        try:
            analytics = StatsModel.get_detailed_analytics()
            return jsonify(analytics), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/nutrition-analysis', methods=['GET'])
    def get_nutrition_analysis():
        """Analyse des distributions nutritionnelles"""
        try:
            analysis = StatsModel.get_nutrition_analysis()
            return jsonify(analysis), 200

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

    @app.route('/api/products/<product_id>', methods=['GET'])
    def get_product_by_id(product_id):
        """Récupère un produit par son ID"""
        try:
            product = ProductModel.get_by_id(product_id)
            if not product:
                return jsonify({"error": "Produit non trouvé"}), 404

            return jsonify(product), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/products/<product_id>/recommendations', methods=['GET'])
    def get_product_recommendations(product_id):

        try:
            # Récupérer le produit actuel
            current_product = ProductModel.get_by_id(product_id)
            if not current_product:
                return jsonify({"error": "Produit non trouvé"}), 404

            current_grade = current_product.get('nutri_score', {}).get('grade', 'E')
            current_category = current_product.get('category', '')

            # Définir les grades meilleurs que celui actuel
            grade_order = ['A', 'B', 'C', 'D', 'E']
            current_index = grade_order.index(current_grade) if current_grade in grade_order else 4
            better_grades = grade_order[:current_index] if current_index > 0 else []

            if not better_grades:
                return jsonify({
                    "message": "Ce produit a déjà le meilleur Nutri-Score possible",
                    "recommendations": []
                }), 200

            # Chercher des alternatives dans la même catégorie avec de meilleurs scores
            recommendations = ProductModel.find_alternatives(
                category=current_category,
                better_grades=better_grades,
                exclude_id=product_id,
                limit=5
            )

            # Si pas assez dans la même catégorie, chercher dans toutes les catégories
            if len(recommendations) < 3:
                additional_recs = ProductModel.find_alternatives(
                    category=None,
                    better_grades=better_grades,
                    exclude_id=product_id,
                    limit=5 - len(recommendations)
                )
                recommendations.extend(additional_recs)

            return jsonify({
                "current_product": {
                    "id": str(current_product['_id']),
                    "name": current_product.get('name'),
                    "grade": current_grade
                },
                "recommendations": recommendations,
                "message": f"Voici {len(recommendations)} alternatives plus saines"
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/nutrition-advice/<grade>', methods=['GET'])
    def get_nutrition_advice(grade):
        """Conseils nutritionnels selon le Nutri-Score"""
        try:
            advice = {
                'A': {
                    "status": "excellent",
                    "message": "Excellent choix nutritionnel !",
                    "description": "Ce produit présente une qualité nutritionnelle optimale. Vous pouvez le consommer régulièrement.",
                    "color": "success",
                    "icon": "✅"
                },
                'B': {
                    "status": "good",
                    "message": "Bon choix nutritionnel",
                    "description": "Ce produit a une bonne qualité nutritionnelle. Idéal pour une consommation régulière.",
                    "color": "success",
                    "icon": "✅"
                },
                'C': {
                    "status": "moderate",
                    "message": "Qualité nutritionnelle correcte",
                    "description": "Ce produit peut être consommé occasionnellement dans le cadre d'une alimentation équilibrée.",
                    "color": "warning",
                    "icon": "⚠️"
                },
                'D': {
                    "status": "poor",
                    "message": "À consommer avec modération",
                    "description": "Ce produit présente une qualité nutritionnelle faible. Limitez sa consommation et privilégiez des alternatives plus saines.",
                    "color": "danger",
                    "icon": "⚠️"
                },
                'E': {
                    "status": "very_poor",
                    "message": "À éviter ou consommer très occasionnellement",
                    "description": "Ce produit présente une qualité nutritionnelle très faible. Privilégiez fortement des alternatives plus saines.",
                    "color": "danger",
                    "icon": "🚫"
                }
            }

            grade_upper = grade.upper()
            if grade_upper not in advice:
                return jsonify({"error": "Grade non valide"}), 400

            return jsonify(advice[grade_upper]), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500