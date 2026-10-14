// pages/admin/DirectionsCentrales.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../axios';
import { 
  Plus, Edit, Trash2, Eye, Search, Building, 
  ChevronRight, ChevronDown, Users, Layers 
} from 'lucide-react';
import Modal from '../../Components/Partials/Components/Modal';
import DirectionCentraleForm from '../../Components/Partials/Components/DirectionCentraleForm';
import DirectionForm from '../../Components/Partials/Components/DirectionForm';
import DepartementForm from '../../Components/Partials/Components/DepartementForm';

const DirectionsCentrales = () => {
  const [directionsCentrales, setDirectionsCentrales] = useState([]);
  const [selectedDirectionCentrale, setSelectedDirectionCentrale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showDCModal, setShowDCModal] = useState(false);
  const [showDirectionModal, setShowDirectionModal] = useState(false);
  const [showDepartementModal, setShowDepartementModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [selectedDepartement, setSelectedDepartement] = useState(null);

  useEffect(() => {
    fetchDirectionsCentrales();
  }, []);

  const fetchDirectionsCentrales = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/juridique/directions-centrales');
      setDirectionsCentrales(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganigramme = async (dcId) => {
    try {
      const response = await axios.get(`/juridique/directions-centrales/${dcId}/organigramme`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'organigramme:', error);
      return null;
    }
  };

  const toggleExpand = async (dcId) => {
    if (!expandedItems[dcId]) {
      // Load organigramme when expanding
      const organigramme = await fetchOrganigramme(dcId);
      setDirectionsCentrales(prev => prev.map(dc => 
        dc._id === dcId ? { ...dc, organigramme } : dc
      ));
    }
    setExpandedItems(prev => ({ ...prev, [dcId]: !prev[dcId] }));
  };

  const toggleDirectionExpand = (dcId, directionId) => {
    setExpandedItems(prev => ({ 
      ...prev, 
      [`${dcId}-${directionId}`]: !prev[`${dcId}-${directionId}`] 
    }));
  };

  const handleCreateDC = () => {
    setModalMode('create');
    setSelectedDirectionCentrale(null);
    setShowDCModal(true);
  };

  const handleEditDC = (dc) => {
    setModalMode('edit');
    setSelectedDirectionCentrale(dc);
    setShowDCModal(true);
  };

  const handleDeleteDC = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette Direction Centrale ?')) {
      try {
        await axios.delete(`/juridique/directions-centrales/${id}`);
        fetchDirectionsCentrales();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCreateDirection = (dc) => {
    setSelectedDirectionCentrale(dc);
    setModalMode('create');
    setSelectedDirection(null);
    setShowDirectionModal(true);
  };

  const handleEditDirection = (dc, direction) => {
    setSelectedDirectionCentrale(dc);
    setSelectedDirection(direction);
    setModalMode('edit');
    setShowDirectionModal(true);
  };

  const handleDeleteDirection = async (directionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette Direction ?')) {
      try {
        await axios.delete(`/juridique/directions/${directionId}`);
        fetchDirectionsCentrales();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCreateDepartement = (dc, direction) => {
    setSelectedDirectionCentrale(dc);
    setSelectedDirection(direction);
    setModalMode('create');
    setSelectedDepartement(null);
    setShowDepartementModal(true);
  };

  const handleEditDepartement = (dc, direction, departement) => {
    setSelectedDirectionCentrale(dc);
    setSelectedDirection(direction);
    setSelectedDepartement(departement);
    setModalMode('edit');
    setShowDepartementModal(true);
  };

  const handleDeleteDepartement = async (departementId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce Département ?')) {
      try {
        await axios.delete(`/juridique/departements/${departementId}`);
        fetchDirectionsCentrales();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const filteredDCs = directionsCentrales.filter(dc =>
    dc.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dc.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Directions Centrales</h1>
        <p className="text-gray-600 mt-1">Gestion hiérarchique des directions et départements</p>
      </div>

      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une direction centrale..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <button
          onClick={handleCreateDC}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Direction Centrale
        </button>
      </div>

      {/* Directions Centrales List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDCs.map((dc) => (
            <div key={dc._id} className="bg-white rounded-lg shadow-md border border-gray-200">
              {/* Direction Centrale Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => toggleExpand(dc._id)}
                    >
                      {expandedItems[dc._id] ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <Building className="w-6 h-6 text-orange-500" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{dc.nom}</h3>
                        <p className="text-sm text-gray-500">Code: {dc.code}</p>
                      </div>
                    </div>
                    {dc.description && (
                      <p className="text-gray-600 mt-2 ml-8">{dc.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCreateDirection(dc)}
                      className="bg-green-50 text-green-600 px-3 py-1.5 rounded hover:bg-green-100 transition-colors flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter Direction
                    </button>
                    <button
                      onClick={() => handleEditDC(dc)}
                      className="bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded hover:bg-yellow-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDC(dc._id)}
                      className="bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Directions List */}
              {expandedItems[dc._id] && dc.organigramme && (
                <div className="p-6 bg-gray-50">
                  <div className="space-y-4">
                    {dc.organigramme.directions?.map((direction) => (
                      <div key={direction._id} className="bg-white rounded-lg border border-gray-200">
                        {/* Direction Header */}
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div 
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => toggleDirectionExpand(dc._id, direction._id)}
                              >
                                {expandedItems[`${dc._id}-${direction._id}`] ? (
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-500" />
                                )}
                                <Users className="w-5 h-5 text-blue-500" />
                                <div>
                                  <h4 className="font-semibold text-gray-800">{direction.nom}</h4>
                                  <p className="text-xs text-gray-500">Code: {direction.code}</p>
                                </div>
                              </div>
                              {direction.description && (
                                <p className="text-sm text-gray-600 mt-2 ml-8">{direction.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCreateDepartement(dc, direction)}
                                className="bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors text-sm flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Département
                              </button>
                              <button
                                onClick={() => handleEditDirection(dc, direction)}
                                className="bg-yellow-50 text-yellow-600 p-1 rounded hover:bg-yellow-100 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDirection(direction._id)}
                                className="bg-red-50 text-red-600 p-1 rounded hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Departements List */}
                        {expandedItems[`${dc._id}-${direction._id}`] && direction.departements && (
                          <div className="p-4 bg-gray-50">
                            <div className="space-y-2">
                              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Départements ({direction.departements.length})
                              </h5>
                              {direction.departements.map((dept) => (
                                <div key={dept._id} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-gray-800">{dept.nom}</p>
                                    <p className="text-xs text-gray-500">Code: {dept.code}</p>
                                    {dept.description && (
                                      <p className="text-xs text-gray-600 mt-1">{dept.description}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEditDepartement(dc, direction, dept)}
                                      className="bg-yellow-50 text-yellow-600 p-1 rounded hover:bg-yellow-100"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDepartement(dept._id)}
                                      className="bg-red-50 text-red-600 p-1 rounded hover:bg-red-100"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {direction.departements.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                  Aucun département. Cliquez sur "Ajouter Département"
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {dc.organigramme.directions?.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        Aucune direction. Cliquez sur "Ajouter Direction" pour commencer
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showDCModal}
        onClose={() => setShowDCModal(false)}
        title={modalMode === 'create' ? 'Créer une Direction Centrale' : 'Modifier la Direction Centrale'}
      >
        <DirectionCentraleForm
          mode={modalMode}
          directionCentrale={selectedDirectionCentrale}
          onSuccess={() => {
            setShowDCModal(false);
            fetchDirectionsCentrales();
          }}
          onCancel={() => setShowDCModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDirectionModal}
        onClose={() => setShowDirectionModal(false)}
        title={modalMode === 'create' ? 'Ajouter une Direction' : 'Modifier la Direction'}
      >
        <DirectionForm
          mode={modalMode}
          direction={selectedDirection}
          directionCentraleId={selectedDirectionCentrale?._id}
          onSuccess={() => {
            setShowDirectionModal(false);
            fetchDirectionsCentrales();
          }}
          onCancel={() => setShowDirectionModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDepartementModal}
        onClose={() => setShowDepartementModal(false)}
        title={modalMode === 'create' ? 'Ajouter un Département' : 'Modifier le Département'}
      >
        <DepartementForm
          mode={modalMode}
          departement={selectedDepartement}
          directionId={selectedDirection?._id}
          onSuccess={() => {
            setShowDepartementModal(false);
            fetchDirectionsCentrales();
          }}
          onCancel={() => setShowDepartementModal(false)}
        />
      </Modal>
    </div>
  );
};

export default DirectionsCentrales;