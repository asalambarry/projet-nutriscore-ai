import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { apiService, queryKeys } from '../services/api';
import './AddProductPage.css';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [showSuccessPage, setShowSuccessPage] = useState(false);

  // Récupérer les données du produit existant
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => apiService.getProduct(id),
    enabled: !!id
  });

  // Préremplir le formulaire quand les données sont chargées
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        category: product.category || '',
        ingredients: product.ingredients || '',
        energy: product.nutrition?.energy || '',
        sugars: product.nutrition?.sugars || '',
        saturated_fat: product.nutrition?.saturated_fat || '',
        salt: product.nutrition?.salt || '',
        fiber: product.nutrition?.fiber || '',
        proteins: product.nutrition?.proteins || '',
        fruits_vegetables_nuts: product.nutrition?.fruits_vegetables_nuts || ''
      });
    }
  }, [product]);

  // Mutation pour modifier le produit
  const updateProductMutation = useMutation({
    mutationFn: (data) => apiService.updateProduct(id, data),
    onSuccess: (data) => {
      // Afficher la notification avec le nouveau Nutri-Score
      const nutriScore = data.nutri_score || data.product?.nutri_score?.grade || 'N/A';
      const productName = data.product?.name || formData.name;
      showSuccess(`Produit "${productName}" modifié avec succès ! Nouveau Nutri-Score: ${nutriScore}`, 5000);

      setShowSuccessPage(true);
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', id]);
      queryClient.invalidateQueries(['stats']);
      // Retourner à la liste après 1.5 secondes
      setTimeout(() => {
        navigate('/products');
      }, 1500);
    },
    onError: (error) => {
      console.error('Erreur:', error);
      showError('Erreur lors de la modification du produit');
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      updateProductMutation.mutate(formData);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="page-container">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container">
        <p>Produit non trouvé</p>
      </div>
    );
  }

  if (showSuccessPage) {
    return (
      <div className="page-container">
        <div className="success-message">
          <h2>Produit modifié avec succès !</h2>
          <p>Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="add-product-layout">
        <div className="form-section">
          <form onSubmit={handleSubmit} className="product-form">
            {/* Informations générales */}
            <div className="form-group">
              <h2>Informations générales</h2>

              <div className="form-field">
                <label>Nom du produit</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Marque</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field">
                  <label>Catégorie</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Ingrédients</label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>

            {/* Valeurs nutritionnelles */}
            <div className="form-group">
              <h2>Valeurs nutritionnelles (pour 100g)</h2>

              <div className="nutrition-grid">
                <div className="form-field">
                  <label>Énergie (kcal)</label>
                  <input
                    type="number"
                    name="energy"
                    value={formData.energy}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-field">
                  <label>Sucres (g)</label>
                  <input
                    type="number"
                    name="sugars"
                    value={formData.sugars}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-field">
                  <label>Graisses saturées (g)</label>
                  <input
                    type="number"
                    name="saturated_fat"
                    value={formData.saturated_fat}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-field">
                  <label>Sel (g)</label>
                  <input
                    type="number"
                    name="salt"
                    value={formData.salt}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-field">
                  <label>Fibres (g)</label>
                  <input
                    type="number"
                    name="fiber"
                    value={formData.fiber}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-field">
                  <label>Protéines (g)</label>
                  <input
                    type="number"
                    name="proteins"
                    value={formData.proteins}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-field">
                  <label>Fruits/Légumes/Noix (%)</label>
                  <input
                    type="number"
                    name="fruits_vegetables_nuts"
                    value={formData.fruits_vegetables_nuts}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={updateProductMutation.isLoading}
            >
              {updateProductMutation.isLoading ? 'Modification...' : 'Modifier'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;