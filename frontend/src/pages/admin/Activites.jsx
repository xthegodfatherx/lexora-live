// pages/admin/Activites.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../axios';
import { 
  Plus, Edit, Trash2, Search, Building, 
  ChevronRight, ChevronDown, Users, Layers, 
  FolderTree, Briefcase, Grid3x3 
} from 'lucide-react';
import Modal from '../../Components/Partials/Components/Modal';
import ActiviteForm from '../../Components/Partials/Components/ActiviteForm';
import DirectionActiviteForm from '../../Components/Partials/Components/DirectionActiviteForm';
import DepartementActiviteForm from '../../Components/Partials/Components/DepartementActiviteForm';
import DivisionForm from '../../Components/Partials/Components/DivisionForm';
import StructureForm from '../../Components/Partials/Components/StructureForm';

const Activites = () => {
  const [activites, setActivites] = useState([]);
  const [selectedActivite, setSelectedActivite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('directions'); // 'directions' or 'divisions'
  
  // Modal states
  const [showActiviteModal, setShowActiviteModal] = useState(false);
  const [showDirectionModal, setShowDirectionModal] = useState(false);
  const [showDepartementModal, setShowDepartementModal] = useState(false);
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  
  const [modalMode, setModalMode] = useState('create');
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [selectedDepartement, setSelectedDepartement] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);

  useEffect(() => {
    fetchActivites();
  }, []);

  const fetchActivites = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/juridique/activites');
      setActivites(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganigramme = async (activiteId) => {
    try {
      // Fetch directions with their departements
      const directionsResponse = await axios.get(`/juridique/direction_activite?activite=${activiteId}`);
      const directions = directionsResponse.data.data;
      
      // Fetch departements for each direction
      const directionsWithDepartements = await Promise.all(
        directions.map(async (direction) => {
          const deptResponse = await axios.get(`/juridique/departemet_activite?directionActivite=${direction._id}`);
          return {
            ...direction,
            departements: deptResponse.data.data
          };
        })
      );
      
      // Fetch divisions with their structures
      const divisionsResponse = await axios.get(`/juridique/division?activite=${activiteId}`);
      const divisions = divisionsResponse.data.data;
      
      // Fetch structures for each division
      const divisionsWithStructures = await Promise.all(
        divisions.map(async (division) => {
          const structuresResponse = await axios.get(`/juridique/structure?division=${division._id}`);
          return {
            ...division,
            structures: structuresResponse.data.data
          };
        })
      );
      
      return {
        directions: directionsWithDepartements,
        divisions: divisionsWithStructures
      };
    } catch (error) {
      console.error('Erreur lors du chargement de l\'organigramme:', error);
      return { directions: [], divisions: [] };
    }
  };

  const toggleExpand = async (activiteId) => {
    const willOpen = !expandedItems[activiteId];
    if (willOpen) {
      const organigramme = await fetchOrganigramme(activiteId);
      setActivites(prev => prev.map(act =>
        act._id === activiteId ? { ...act, organigramme } : act
      ));
    }
    setExpandedItems(prev => ({ ...prev, [activiteId]: willOpen }));
  };

  const toggleDirectionExpand = (activiteId, directionId) => {
    setExpandedItems(prev => ({ 
      ...prev, 
      [`${activiteId}-dir-${directionId}`]: !prev[`${activiteId}-dir-${directionId}`] 
    }));
  };

  const toggleDivisionExpand = (activiteId, divisionId) => {
    setExpandedItems(prev => ({ 
      ...prev, 
      [`${activiteId}-div-${divisionId}`]: !prev[`${activiteId}-div-${divisionId}`] 
    }));
  };

  const handleCreateActivite = () => {
    setModalMode('create');
    setSelectedActivite(null);
    setShowActiviteModal(true);
  };

  const handleEditActivite = (activite) => {
    setModalMode('edit');
    setSelectedActivite(activite);
    setShowActiviteModal(true);
  };

  const handleDeleteActivite = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette Activité ?')) {
      try {
        await axios.delete(`/juridique/activites/${id}`);
        fetchActivites();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  // Direction handlers
  const handleCreateDirection = (activite) => {
    setSelectedActivite(activite);
    setModalMode('create');
    setSelectedDirection(null);
    setShowDirectionModal(true);
  };

  const handleEditDirection = (activite, direction) => {
    setSelectedActivite(activite);
    setSelectedDirection(direction);
    setModalMode('edit');
    setShowDirectionModal(true);
  };

  const handleDeleteDirection = async (directionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette Direction ?')) {
      try {
        await axios.delete(`/juridique/direction_activite/${directionId}`);
        const updatedActivites = [...activites];
        const activiteIndex = updatedActivites.findIndex(a => a.organigramme);
        if (activiteIndex !== -1) {
          updatedActivites[activiteIndex].organigramme.directions = 
            updatedActivites[activiteIndex].organigramme.directions.filter(d => d._id !== directionId);
          setActivites(updatedActivites);
        }
        fetchActivites();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  // Departement handlers
  const handleCreateDepartement = (activite, direction) => {
    setSelectedActivite(activite);
    setSelectedDirection(direction);
    setModalMode('create');
    setSelectedDepartement(null);
    setShowDepartementModal(true);
  };

  const handleEditDepartement = (activite, direction, departement) => {
    setSelectedActivite(activite);
    setSelectedDirection(direction);
    setSelectedDepartement(departement);
    setModalMode('edit');
    setShowDepartementModal(true);
  };

  const handleDeleteDepartement = async (departementId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce Département ?')) {
      try {
        await axios.delete(`/juridique/departemet_activite/${departementId}`);
        fetchActivites();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  // Division handlers
  const handleCreateDivision = (activite) => {
    setSelectedActivite(activite);
    setModalMode('create');
    setSelectedDivision(null);
    setShowDivisionModal(true);
  };

  const handleEditDivision = (activite, division) => {
    setSelectedActivite(activite);
    setSelectedDivision(division);
    setModalMode('edit');
    setShowDivisionModal(true);
  };

  const handleDeleteDivision = async (divisionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette Division ?')) {
      try {
        await axios.delete(`/juridique/division/${divisionId}`);
        fetchActivites();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  // Structure handlers
  const handleCreateStructure = (activite, division) => {
    setSelectedActivite(activite);
    setSelectedDivision(division);
    setModalMode('create');
    setSelectedStructure(null);
    setShowStructureModal(true);
  };

  const handleEditStructure = (activite, division, structure) => {
    setSelectedActivite(activite);
    setSelectedDivision(division);
    setSelectedStructure(structure);
    setModalMode('edit');
    setShowStructureModal(true);
  };

  const handleDeleteStructure = async (structureId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette Structure ?')) {
      try {
        await axios.delete(`/juridique/structure/${structureId}`);
        fetchActivites();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const filteredActivites = activites.filter(act =>
    act.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadgeColor = (type) => {
    return type === 'direction' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Activités</h1>
        <p className="text-gray-600 mt-1">Gestion hiérarchique des directions, départements, divisions et structures</p>
      </div>

      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une activité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <button
          onClick={handleCreateActivite}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Activité
        </button>
      </div>

      {/* Activities List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivites.map((activite) => (
            <div key={activite._id} className="bg-white rounded-lg shadow-md border border-gray-200">
              {/* Activite Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => toggleExpand(activite._id)}
                    >
                      {expandedItems[activite._id] ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <Briefcase className="w-6 h-6 text-orange-500" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{activite.nom}</h3>
                        <p className="text-sm text-gray-500">Code: {activite.code}</p>
                      </div>
                    </div>
                    {activite.description && (
                      <p className="text-gray-600 mt-2 ml-8">{activite.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCreateDirection(activite)}
                      className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Direction
                    </button>
                    <button
                      onClick={() => handleCreateDivision(activite)}
                      className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded hover:bg-purple-100 transition-colors flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Division
                    </button>
                    <button
                      onClick={() => handleEditActivite(activite)}
                      className="bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded hover:bg-yellow-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteActivite(activite._id)}
                      className="bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Organigramme Content */}
              {expandedItems[activite._id] && activite.organigramme && (
                <div className="p-6 bg-gray-50">
                  {/* Tab Navigation */}
                  <div className="flex border-b border-gray-200 mb-6">
                    <button
                      onClick={() => setActiveTab('directions')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'directions'
                          ? 'text-orange-600 border-b-2 border-orange-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Building className="w-4 h-4 inline mr-2" />
                      Directions & Départements
                    </button>
                    <button
                      onClick={() => setActiveTab('divisions')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'divisions'
                          ? 'text-orange-600 border-b-2 border-orange-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FolderTree className="w-4 h-4 inline mr-2" />
                      Divisions & Structures
                    </button>
                  </div>

                  {/* Directions and Departements Tab */}
                  {activeTab === 'directions' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5 text-blue-600" />
                        Directions
                      </h4>
                      {activite.organigramme.directions?.map((direction) => (
                        <div key={direction._id} className="bg-white rounded-lg border border-gray-200">
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div 
                                  className="flex items-center gap-3 cursor-pointer"
                                  onClick={() => toggleDirectionExpand(activite._id, direction._id)}
                                >
                                  {expandedItems[`${activite._id}-dir-${direction._id}`] ? (
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
                                  onClick={() => handleCreateDepartement(activite, direction)}
                                  className="bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors text-xs flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  Département
                                </button>
                                <button
                                  onClick={() => handleEditDirection(activite, direction)}
                                  className="bg-yellow-50 text-yellow-600 p-1 rounded hover:bg-yellow-100"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDirection(direction._id)}
                                  className="bg-red-50 text-red-600 p-1 rounded hover:bg-red-100"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Departements */}
                          {expandedItems[`${activite._id}-dir-${direction._id}`] && direction.departements && (
                            <div className="p-4 bg-gray-50">
                              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Départements ({direction.departements.length})
                              </h5>
                              <div className="space-y-2">
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
                                        onClick={() => handleEditDepartement(activite, direction, dept)}
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
                      {activite.organigramme.directions?.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          Aucune direction. Cliquez sur "Ajouter Direction" pour commencer
                        </p>
                      )}
                    </div>
                  )}

                  {/* Divisions and Structures Tab */}
                  {activeTab === 'divisions' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FolderTree className="w-5 h-5 text-purple-600" />
                        Divisions
                      </h4>
                      {activite.organigramme.divisions?.map((division) => (
                        <div key={division._id} className="bg-white rounded-lg border border-gray-200">
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div 
                                  className="flex items-center gap-3 cursor-pointer"
                                  onClick={() => toggleDivisionExpand(activite._id, division._id)}
                                >
                                  {expandedItems[`${activite._id}-div-${division._id}`] ? (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                  )}
                                  <Grid3x3 className="w-5 h-5 text-purple-500" />
                                  <div>
                                    <h4 className="font-semibold text-gray-800">{division.nom}</h4>
                                    <p className="text-xs text-gray-500">Code: {division.code}</p>
                                  </div>
                                </div>
                                {division.description && (
                                  <p className="text-sm text-gray-600 mt-2 ml-8">{division.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleCreateStructure(activite, division)}
                                  className="bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors text-xs flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  Structure
                                </button>
                                <button
                                  onClick={() => handleEditDivision(activite, division)}
                                  className="bg-yellow-50 text-yellow-600 p-1 rounded hover:bg-yellow-100"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDivision(division._id)}
                                  className="bg-red-50 text-red-600 p-1 rounded hover:bg-red-100"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Structures */}
                          {expandedItems[`${activite._id}-div-${division._id}`] && division.structures && (
                            <div className="p-4 bg-gray-50">
                              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Structures ({division.structures.length})
                              </h5>
                              <div className="space-y-2">
                                {division.structures.map((structure) => (
                                  <div key={structure._id} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeBadgeColor(structure.type)}`}>
                                          {structure.type === 'direction' ? 'Direction' : 'Département'}
                                        </span>
                                        <p className="font-medium text-gray-800">{structure.nom}</p>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">Code: {structure.code}</p>
                                      {structure.description && (
                                        <p className="text-xs text-gray-600 mt-1">{structure.description}</p>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleEditStructure(activite, division, structure)}
                                        className="bg-yellow-50 text-yellow-600 p-1 rounded hover:bg-yellow-100"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteStructure(structure._id)}
                                        className="bg-red-50 text-red-600 p-1 rounded hover:bg-red-100"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {division.structures.length === 0 && (
                                  <p className="text-sm text-gray-500 text-center py-4">
                                    Aucune structure. Cliquez sur "Ajouter Structure"
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {activite.organigramme.divisions?.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          Aucune division. Cliquez sur "Ajouter Division" pour commencer
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showActiviteModal}
        onClose={() => setShowActiviteModal(false)}
        title={modalMode === 'create' ? 'Créer une Activité' : 'Modifier l\'Activité'}
      >
        <ActiviteForm
          mode={modalMode}
          activite={selectedActivite}
          onSuccess={() => {
            setShowActiviteModal(false);
            fetchActivites();
          }}
          onCancel={() => setShowActiviteModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDirectionModal}
        onClose={() => setShowDirectionModal(false)}
        title={modalMode === 'create' ? 'Ajouter une Direction' : 'Modifier la Direction'}
      >
        <DirectionActiviteForm
          mode={modalMode}
          direction={selectedDirection}
          activiteId={selectedActivite?._id}
          onSuccess={() => {
            setShowDirectionModal(false);
            fetchActivites();
          }}
          onCancel={() => setShowDirectionModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDepartementModal}
        onClose={() => setShowDepartementModal(false)}
        title={modalMode === 'create' ? 'Ajouter un Département' : 'Modifier le Département'}
      >
        <DepartementActiviteForm
          mode={modalMode}
          departement={selectedDepartement}
          directionId={selectedDirection?._id}
          onSuccess={() => {
            setShowDepartementModal(false);
            fetchActivites();
          }}
          onCancel={() => setShowDepartementModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDivisionModal}
        onClose={() => setShowDivisionModal(false)}
        title={modalMode === 'create' ? 'Ajouter une Division' : 'Modifier la Division'}
      >
        <DivisionForm
          mode={modalMode}
          division={selectedDivision}
          activiteId={selectedActivite?._id}
          onSuccess={() => {
            setShowDivisionModal(false);
            fetchActivites();
          }}
          onCancel={() => setShowDivisionModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showStructureModal}
        onClose={() => setShowStructureModal(false)}
        title={modalMode === 'create' ? 'Ajouter une Structure' : 'Modifier la Structure'}
      >
        <StructureForm
          mode={modalMode}
          structure={selectedStructure}
          divisionId={selectedDivision?._id}
          onSuccess={() => {
            setShowStructureModal(false);
            fetchActivites();
          }}
          onCancel={() => setShowStructureModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Activites;