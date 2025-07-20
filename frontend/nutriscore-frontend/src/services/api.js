// ===========================================
// SERVICE API NUTRI-SCORE
// Communication avec le backend Flask
// ===========================================

import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

// Instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les réponses (gestion d'erreurs globale)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ===========================================
// UTILITAIRES
// ===========================================

// Fonction pour nettoyer et normaliser les données produit
const sanitizeProductData = (product) => {
  if (!product) return null;

  return {
    ...product,
    // S'assurer que les IDs sont bien formatés
    id: product._id || product.id,
    _id: product._id || product.id,
    // Nettoyer les données nutritionnelles - IMPORTANT pour le rendu
    nutrition: product.nutrition ? {
      energy: parseFloat(product.nutrition.energy) || 0,
      sugars: parseFloat(product.nutrition.sugars) || 0,
      saturated_fat: parseFloat(product.nutrition.saturated_fat) || 0,
      salt: parseFloat(product.nutrition.salt) || 0,
      fiber: parseFloat(product.nutrition.fiber) || 0,
      proteins: parseFloat(product.nutrition.proteins) || 0,
      fruits_vegetables_nuts: parseFloat(product.nutrition.fruits_vegetables_nuts) || 0,
    } : null,
    // S'assurer que le nutri_score existe
    nutri_score: product.nutri_score || { grade: 'N/A', probabilities: {} },
    // Nettoyer les strings
    name: product.name || 'Produit sans nom',
    brand: product.brand || '',
    category: product.category || 'Non catégorisé',
    ingredients: product.ingredients || '',
  };
};

// ===========================================
// SERVICES API
// ===========================================

export const apiService = {
  // Santé de l'API
  health: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // ===== PRODUITS =====

  // Créer un produit avec prédiction automatique
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Récupérer la liste des produits
  getProducts: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      search = '',
      nutri_score = '',
      category = ''
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(nutri_score && { nutri_score }),
      ...(category && { category })
    });

    const response = await api.get(`/products?${queryParams}`);
    const data = response.data;

    // Nettoyer les données des produits - IMPORTANT pour éviter les erreurs de rendu
    if (data.products && Array.isArray(data.products)) {
      data.products = data.products.map(sanitizeProductData).filter(Boolean);
    }

    return data;
  },

  // Récupérer un produit par ID
  getProduct: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    const data = response.data;
    return sanitizeProductData(data);
  },

  // Mettre à jour un produit
  updateProduct: async (productId, productData) => {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  },

  // Supprimer un produit
  deleteProduct: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  // ===== RECHERCHE INTELLIGENTE =====

  // Recherche avec prédiction automatique
  searchAndPredict: async (searchData) => {
    const response = await api.post('/search-predict', searchData);
    return response.data;
  },

  // Recherche par code-barres
  searchByBarcode: async (barcode) => {
    const response = await api.get(`/search-barcode/${barcode}`);
    return response.data;
  },

  // ===== PRÉDICTIONS =====

  // Prédiction directe sans sauvegarde
  predict: async (nutritionData) => {
    const response = await api.post('/predict', nutritionData);
    return response.data;
  },

  // Historique des prédictions
  getPredictions: async (params = {}) => {
    const { page = 1, limit = 20 } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await api.get(`/predictions?${queryParams}`);
    return response.data;
  },

  // ===== STATISTIQUES =====

  // Statistiques générales
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  // Analyses détaillées pour dashboards
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },

  // Analyse des distributions nutritionnelles
  getNutritionAnalysis: async () => {
    const response = await api.get('/nutrition-analysis');
    return response.data;
  },

  // ===== RECHERCHE AVANCÉE =====

  // Recherche avancée avec filtres
  advancedSearch: async (params = {}) => {
    const {
      q = '',
      nutri_score = '',
      category = '',
      brand = ''
    } = params;

    const queryParams = new URLSearchParams({
      ...(q && { q }),
      ...(nutri_score && { nutri_score }),
      ...(category && { category }),
      ...(brand && { brand })
    });

    const response = await api.get(`/search?${queryParams}`);
    return response.data;
  }
};

// ===========================================
// HOOKS PERSONNALISÉS POUR REACT QUERY
// ===========================================

// Fonctions pour React Query
export const queryKeys = {
  products: (params) => ['products', params],
  product: (id) => ['product', id],
  predictions: (params) => ['predictions', params],
  stats: () => ['stats'],
  analytics: () => ['analytics'],
  nutritionAnalysis: () => ['nutrition-analysis'],
  health: () => ['health'],
  search: (params) => ['search', params]
};

// ===========================================
// UTILITAIRES
// ===========================================

// Formater les données nutritionnelles pour l'API
export const formatNutritionData = (data) => {
  return {
    energy: parseFloat(data.energy) || 0,
    sugars: parseFloat(data.sugars) || 0,
    saturated_fat: parseFloat(data.saturated_fat) || 0,
    salt: parseFloat(data.salt) || 0,
    fiber: parseFloat(data.fiber) || 0,
    proteins: parseFloat(data.proteins) || 0,
    fruits_vegetables_nuts: parseFloat(data.fruits_vegetables_nuts) || 0
  };
};

// Valider les données nutritionnelles
export const validateNutritionData = (data) => {
  const errors = [];
  const requiredFields = ['energy', 'sugars', 'saturated_fat', 'salt', 'fiber', 'proteins', 'fruits_vegetables_nuts'];

  requiredFields.forEach(field => {
    const value = parseFloat(data[field]);
    if (isNaN(value) || value < 0) {
      errors.push(`${field} doit être un nombre positif`);
    }

    if (field === 'fruits_vegetables_nuts' && value > 100) {
      errors.push('Le pourcentage de fruits/légumes ne peut pas dépasser 100%');
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Obtenir la couleur du Nutri-Score
export const getNutriScoreColor = (grade) => {
  const colors = {
    'A': '#00a550',
    'B': '#85c440',
    'C': '#f9b000',
    'D': '#ff8c00',
    'E': '#e63946'
  };
  return colors[grade?.toUpperCase()] || '#bdc3c7';
};

// Obtenir le texte descriptif du Nutri-Score
export const getNutriScoreText = (grade) => {
  const descriptions = {
    'A': 'Excellent',
    'B': 'Bon',
    'C': 'Moyen',
    'D': 'Médiocre',
    'E': 'Mauvais'
  };
  return descriptions[grade?.toUpperCase()] || 'Non évalué';
};

// Formatter la date
export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Débounce pour la recherche
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default api;