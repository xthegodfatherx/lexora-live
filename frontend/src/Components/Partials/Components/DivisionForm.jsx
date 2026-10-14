// Components/Partials/Components/DivisionForm.jsx
import React, { useState } from 'react';
import axios from '../../../axios';

const DivisionForm = ({ mode, division, activiteId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    code: division?.code || '',
    nom: division?.nom || '',
    description: division?.description || '',
    activite: division?.activite || activiteId || '',
    actif: division?.actif !== undefined ? division.actif : true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = 'Le code est obligatoire';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        await axios.post('/juridique/division', formData);
      } else {
        await axios.put(`/juridique/division/${division._id}`, formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
            errors.code ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: DIV_FIN"
        />
        {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
            errors.nom ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: Division Financière"
        />
        {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          placeholder="Description de la division..."
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="actif"
          checked={formData.actif}
          onChange={handleChange}
          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">Actif</label>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {errors.submit}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Modifier'}
        </button>
      </div>
    </form>
  );
};

export default DivisionForm;