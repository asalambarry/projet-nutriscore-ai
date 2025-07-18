// ===========================================
// PAGE AJOUT PRODUIT - Fonctionnelle
// ===========================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
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

  const createProductMutation = useMutation({
    mutationFn: apiService.createProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['stats']);

      const nutriScore = data.nutri_score || data.product?.nutri_score?.grade || 'N/A';
      const productName = data.product?.name || formData.name;
      showSuccess(`Produit "${productName}" ajouté ! Nutri-Score: ${nutriScore}`);

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

  return (
    <div className="add-product-simple">
      <form onSubmit={handleSubmit} className="simple-form">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nom du produit"
          required
        />

        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="Marque"
        />

        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Catégorie"
        />

        <textarea
          name="ingredients"
          value={formData.ingredients}
          onChange={handleChange}
          placeholder="Ingrédients"
          rows="2"
        />

        <input
          type="number"
          name="energy"
          value={formData.energy}
          onChange={handleChange}
          placeholder="Énergie (kcal)"
          min="0"
          step="0.1"
        />

        <input
          type="number"
          name="sugars"
          value={formData.sugars}
          onChange={handleChange}
          placeholder="Sucres (g)"
          min="0"
          step="0.1"
        />

        <input
          type="number"
          name="saturated_fat"
          value={formData.saturated_fat}
          onChange={handleChange}
          placeholder="Graisses saturées (g)"
          min="0"
          step="0.1"
        />

        <input
          type="number"
          name="salt"
          value={formData.salt}
          onChange={handleChange}
          placeholder="Sel (g)"
          min="0"
          step="0.01"
        />

        <input
          type="number"
          name="fiber"
          value={formData.fiber}
          onChange={handleChange}
          placeholder="Fibres (g)"
          min="0"
          step="0.1"
        />

        <input
          type="number"
          name="proteins"
          value={formData.proteins}
          onChange={handleChange}
          placeholder="Protéines (g)"
          min="0"
          step="0.1"
        />

        <input
          type="number"
          name="fruits_vegetables_nuts"
          value={formData.fruits_vegetables_nuts}
          onChange={handleChange}
          placeholder="Fruits/Légumes/Noix (%)"
          min="0"
          max="100"
          step="0.1"
        />

        <button
          type="submit"
          className="submit-btn"
          disabled={createProductMutation.isLoading}
        >
          {createProductMutation.isLoading ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;