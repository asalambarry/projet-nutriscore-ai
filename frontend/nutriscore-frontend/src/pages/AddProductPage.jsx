
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import NutritionAlert from '../components/NutritionAlert';
import { useNotification } from '../hooks/useNotification';
import { apiService } from '../services/api';
import './AddProductPage.css';

const AddProductPage = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    ingredients: '',
    energy: '',
    sugars: '',
    saturated_fat: '',
    salt: '',
    fiber: '',
    proteins: '',
    fruits_vegetables_nuts: ''
  });

  const [lastCreatedProduct, setLastCreatedProduct] = useState(null);
  const [showNutritionAlert, setShowNutritionAlert] = useState(false);

  const createProductMutation = useMutation({
    mutationFn: apiService.createProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['stats']);

      const nutriScore = data.nutri_score || data.product?.nutri_score?.grade || 'N/A';
      const productName = data.product?.name || formData.name;
      const productId = data.product?._id;

      showSuccess(`Produit "${productName}" ajouté ! Nutri-Score: ${nutriScore}`);

      // Afficher l'alerte nutritionnelle pour tous les scores
      if (nutriScore && nutriScore !== 'N/A') {
        setLastCreatedProduct({
          name: productName,
          grade: nutriScore,
          id: productId
        });
        setShowNutritionAlert(true);
      }

      setFormData({
        name: '',
        brand: '',
        category: '',
        ingredients: '',
        energy: '',
        sugars: '',
        saturated_fat: '',
        salt: '',
        fiber: '',
        proteins: '',
        fruits_vegetables_nuts: ''
      });
    },
    onError: () => {
      showError('Erreur lors de l\'ajout du produit');
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      createProductMutation.mutate(formData);
    }
  };

  const handleCloseAlert = () => {
    setShowNutritionAlert(false);
    setLastCreatedProduct(null);
  };

  return (
    <div className="add-product-simple">
      {/* Alerte nutritionnelle pour les mauvais scores */}
      {showNutritionAlert && lastCreatedProduct && (
        <div className="nutrition-alert-container">
          <NutritionAlert
            grade={lastCreatedProduct.grade}
            showRecommendations={true}
            productId={lastCreatedProduct.id}
            onClose={handleCloseAlert}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="simple-form">
        <input
          type="text"
          name="name"
          placeholder="Nom du produit *"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="brand"
          placeholder="Marque"
          value={formData.brand}
          onChange={handleChange}
        />

        <input
          type="text"
          name="category"
          placeholder="Catégorie"
          value={formData.category}
          onChange={handleChange}
        />

        <textarea
          name="ingredients"
          placeholder="Ingrédients"
          value={formData.ingredients}
          onChange={handleChange}
          rows="3"
        />

        <div className="nutrition-grid">
          <input
            type="number"
            name="energy"
            placeholder="Énergie (kJ)"
            value={formData.energy}
            onChange={handleChange}
            step="0.1"
            min="0"
          />

          <input
            type="number"
            name="sugars"
            placeholder="Sucres (g)"
            value={formData.sugars}
            onChange={handleChange}
            step="0.1"
            min="0"
          />

          <input
            type="number"
            name="saturated_fat"
            placeholder="Graisses saturées (g)"
            value={formData.saturated_fat}
            onChange={handleChange}
            step="0.1"
            min="0"
          />

          <input
            type="number"
            name="salt"
            placeholder="Sel (g)"
            value={formData.salt}
            onChange={handleChange}
            step="0.1"
            min="0"
          />

          <input
            type="number"
            name="fiber"
            placeholder="Fibres (g)"
            value={formData.fiber}
            onChange={handleChange}
            step="0.1"
            min="0"
          />

          <input
            type="number"
            name="proteins"
            placeholder="Protéines (g)"
            value={formData.proteins}
            onChange={handleChange}
            step="0.1"
            min="0"
          />

          <input
            type="number"
            name="fruits_vegetables_nuts"
            placeholder="Fruits/légumes/noix (%)"
            value={formData.fruits_vegetables_nuts}
            onChange={handleChange}
            step="0.1"
            min="0"
            max="100"
          />
        </div>

        <button
          type="submit"
          disabled={createProductMutation.isLoading}
          className="submit-btn"
        >
          {createProductMutation.isLoading ? 'Ajout...' : 'Ajouter le produit'}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;