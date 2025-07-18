#!/usr/bin/env python3

import json
import os

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OrdinalEncoder, StandardScaler


def clean_data_like_notebook(df):

    # Créer une copie pour le nettoyage
    df_clean = df.copy()

    # Remplacement des valeurs manquantes selon le type de données
    df_clean['name'] = df_clean['name'].fillna('Sans nom')
    df_clean['ingredients_text'] = df_clean['ingredients_text'].fillna('Non spécifié')

    # Traitement des colonnes de listes
    list_columns = ['categories', 'brands', 'additives']
    for col in list_columns:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].fillna('[]').apply(lambda x: x if isinstance(x, list) else [])

    # Remplacement des valeurs numériques manquantes par la médiane
    numeric_columns = ['nova', 'energy', 'sugars', 'saturated_fat', 'salt', 'fiber', 'proteins', 'fruits_vegetables_nuts']

    for col in numeric_columns:
        if col in df_clean.columns:
            median_value = df_clean[col].median()
            before_count = df_clean[col].isnull().sum()
            df_clean[col] = df_clean[col].fillna(median_value)
            if before_count > 0:
                print(f"{col}: {before_count} NaN remplacés par {median_value:.2f}")

    # Suppression des doublons (comme dans le notebook)
    print("Suppression des doublons...")
    df_check = df_clean.copy()
    list_columns = ['categories', 'brands', 'additives']
    for col in list_columns:
        if col in df_check.columns:
            df_check[col] = df_check[col].apply(lambda x: str(x) if isinstance(x, list) else str([]))

    duplicate_indices = df_check.duplicated()
    df_clean = df_clean[~duplicate_indices]

    duplicates_removed = duplicate_indices.sum()
    if duplicates_removed > 0:
        print(f"{duplicates_removed} doublons supprimés")

    return df_clean

def main():
    print("GÉNÉRATION DU MODÈLE NUTRI-SCORE COMPATIBLE")
    print("=" * 55)
    print(f"🔧 Version scikit-learn: {sklearn.__version__}")

    # 1. CHARGEMENT DES DONNÉES
    print("\nChargement des données...")

    try:
        # Charger les données depuis le CSV
        df = pd.read_csv('produits_alimentaires_nettoyes.csv')
        print(f"Données chargées: {len(df)} produits")
    except FileNotFoundError:
        print("Fichier 'produits_alimentaires_nettoyes.csv' non trouvé")
        print("Exécutez d'abord les cellules 1-10 de votre notebook")
        return False

    # 2. NETTOYAGE COMME DANS LE NOTEBOOK
    df_clean = clean_data_like_notebook(df)
    print(f"Données nettoyées: {len(df_clean)} produits")

    # 3. PRÉPARATION DES DONNÉES POUR LE MODÈLE
    print("\nPréparation des données pour le modèle...")

    # Features pour le modèle
    features = ['energy', 'sugars', 'saturated_fat', 'salt', 'fiber', 'proteins', 'fruits_vegetables_nuts']

    # Vérifier que toutes les colonnes existent
    missing_cols = [col for col in features if col not in df_clean.columns]
    if missing_cols:
        print(f"Colonnes manquantes: {missing_cols}")
        return False

    # Vérifier la colonne nutrition_grade
    if 'nutrition_grade' not in df_clean.columns:
        print("Colonne 'nutrition_grade' manquante")
        return False

    X = df_clean[features]
    y = df_clean['nutrition_grade']

    # Filtrer les Nutri-Scores valides
    valid_scores = ['a', 'b', 'c', 'd', 'e']
    mask = y.isin(valid_scores)
    X = X[mask]
    y = y[mask]

    print(f"Features: {features}")
    print(f"Échantillons valides: {len(X)}")

    # Vérification finale des NaN
    remaining_nans = X.isnull().sum().sum()
    if remaining_nans > 0:
        print(f"Il reste {remaining_nans} valeurs NaN dans les features")
        print("Détail:")
        for col in features:
            nan_count = X[col].isnull().sum()
            if nan_count > 0:
                print(f"   {col}: {nan_count} NaN")
        return False
    else:
        print("Aucune valeur NaN dans les features")

    print(f"Distribution: {y.value_counts().sort_index().to_dict()}")

    # 4. ENCODAGE ET DIVISION
    print("\nEncodage et division...")

    # Encodage ordinal des scores (a=0, b=1, c=2, d=3, e=4)
    oe = OrdinalEncoder(categories=[valid_scores])
    y_encoded = oe.fit_transform(y.values.reshape(-1, 1)).ravel()

    # Division train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    # Standardisation
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print(f"Train: {len(X_train)} échantillons")
    print(f"Test: {len(X_test)} échantillons")

    # 5. ENTRAÎNEMENT
    print("\nEntraînement du modèle...")

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        n_jobs=-1
    )

    model.fit(X_train_scaled, y_train)

    # 6. ÉVALUATION
    print("\nÉvaluation...")

    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"Précision: {accuracy:.1%}")

    target_names = ['A', 'B', 'C', 'D', 'E']
    print("\nRapport détaillé:")
    print(classification_report(y_test, y_pred, target_names=target_names))

    # 7. SAUVEGARDE
    print("\nSauvegarde du modèle...")

    # Créer le dossier
    os.makedirs('saved_models', exist_ok=True)

    # Sauvegarder les composants
    joblib.dump(model, 'saved_models/nutriscore_model.joblib')
    joblib.dump(scaler, 'saved_models/nutriscore_scaler.joblib')
    joblib.dump(oe, 'saved_models/nutriscore_encoder.joblib')

    # Métadonnées
    model_info = {
        'accuracy': accuracy,
        'features': features,
        'n_samples': len(X),
        'sklearn_version': sklearn.__version__,
        'model_type': 'RandomForestClassifier',
        'target_names': target_names,
        'created_with': 'train_model.py',
        'cleaned_like_notebook': True
    }

    with open('saved_models/model_info.json', 'w') as f:
        json.dump(model_info, f, indent=2)

    print("Fichiers sauvegardés:")
    print("   - saved_models/nutriscore_model.joblib")
    print("   - saved_models/nutriscore_scaler.joblib")
    print("   - saved_models/nutriscore_encoder.joblib")
    print("   - saved_models/model_info.json")

    # 8. TEST DE COMPATIBILITÉ
    print("\nTest de compatibilité...")

    try:
        # Test de rechargement
        model_test = joblib.load('saved_models/nutriscore_model.joblib')
        scaler_test = joblib.load('saved_models/nutriscore_scaler.joblib')
        encoder_test = joblib.load('saved_models/nutriscore_encoder.joblib')

        # Test de prédiction
        test_input = [[80, 6, 2.5, 0.1, 0, 4, 0]]  # Yaourt nature
        test_scaled = scaler_test.transform(test_input)
        test_pred = model_test.predict(test_scaled)
        test_proba = model_test.predict_proba(test_scaled)
        test_grade = chr(65 + int(test_pred[0]))

        print(f"Modèle rechargé avec succès")
        print(f"Test yaourt nature: {test_grade}")
        print(f"Probabilités: {dict(zip(target_names, [f'{p:.1%}' for p in test_proba[0]]))}")

    except Exception as e:
        print(f"Erreur de compatibilité: {e}")
        return False

    print(f"\nMODÈLE GÉNÉRÉ AVEC SUCCÈS!")
    print(f"Votre backend peut maintenant charger le modèle sans erreur!")
    print(f"Lancez: python app.py")

    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)