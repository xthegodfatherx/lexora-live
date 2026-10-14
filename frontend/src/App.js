import React from 'react';

import './App.css';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from './Components/Login/Login';
import Pagedacceuille from './Components/Login/Pagedacceuille';
import ResetPasswordConfirm from './Components/Login/ResetPassword';
import ForgotPassword from './Components/Login/ForgotPassword';

import { AdminLayout } from './Layouts/AdminLayout';
import { VicePresidentLayout } from './Layouts/VicePresidentLayout';
import { DirecteurCentraleLayout } from './Layouts/DirecteurCentraleLayout';
import { AssistantDirecteurCentraleLayout } from './Layouts/AssistantDirecteurCentraleLayout';
import { DirecteurDirectionLayout } from './Layouts/DirecteurDirectionLayout';
import { ResponsableDepartementLayout } from './Layouts/ResponsableDepartementLayout';
import { DirecteurDirectionActiviteLayout } from './Layouts/DirecteurDirectionActiviteLayout';
import { DirecteurDivisionActiviteLayout } from './Layouts/DirecteurDivisionActiviteLayout';
import { ResponsableDirectionDivisionLayout } from './Layouts/ResponsableDirectionDivisionLayout';
import { ResponsableDepartementDivisionLayout } from './Layouts/ResponsableDepartementDivisionLayout';
import { AgentLayout } from './Layouts/AgentLayout';

// Pages
import DirectionsCentrales from './pages/admin/DirectionsCentrales';
import Activites from './pages/admin/Activites';
import UsersListe from './Components/admin/Components/utilisateurs/UsersListe';
import Affectations from './Components/admin/Components/Affectation';
import DepartementAffectations from './Components/directeurdirection/DepartementAffectations';
import AffectationVicePresident from './Components/admin/Components/VicePresident/AffectationVicePresident';
import Bib from './Components/Bib/Bib';
import ContratsListe from './Components/chefdepartement/ContratsListe';
import NotificationsPage from './Components/Notification/NotificationsPage';
import Profile from './pages/Profile';
import Dashboard from './Components/admin/dashboard';
import Dashboardres from './Components/admin/dasboardres';
import NotFound from './Components/Partials/Components/NotFound';
import Unauthorized from './Components/Partials/Components/Unauthorized';
import PageEnConstruction from './Components/Partials/Components/PageEnConstruction';
import DerWorkspace from './der/DerWorkspace';
import AuditJournal from './pages/admin/AuditJournal';
import Configuration from './pages/admin/Configuration';
import ArbitrageWorkspace from './arbitrage/ArbitrageWorkspace';

// Placeholder pour les entrées de menu dont l'écran n'est pas encore construit.
// Chaque chemin présent dans une sidebar DOIT avoir une route ici — sinon le
// lien tombe sur la page 404 (en dehors du layout).
const enConstruction = (titre) => <PageEnConstruction titre={titre} />;

// Écrans communs à tous les rôles (liens "Paramètres" de SidebarLayout : profile / notifications)
const communs = [
  { path: 'profile', element: <Profile /> },
  { path: 'notifications', element: <NotificationsPage /> },
  { path: 'der', element: <DerWorkspace /> },
  { path: 'arbitrage', element: <ArbitrageWorkspace /> },
];

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/accueil" replace />,
  },
  {
    path: '/accueil',
    element: <Pagedacceuille />,
  },
  {
    path: '/mot-de-passe-oublie',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password/:uid/:token',
    element: <ResetPasswordConfirm />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },

  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      // { index: true, element: enConstruction('Dashboard') },
      // { path: 'dashboard', element: enConstruction('Dashboard') },
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> }, 
      { path: 'directions-centrales', element: <DirectionsCentrales /> },
      { path: 'activites', element: <Activites /> },
      { path: 'utilisateurs', element: <UsersListe /> },
      { path: 'affectation', element: <Affectations /> },
      { path: 'bib', element: <Bib /> },
      { path: 'der', element: <DerWorkspace /> },
      { path: 'arbitrage', element: <ArbitrageWorkspace /> },
      { path: 'profile', element: <Profile /> },
      { path: 'notification', element: <NotificationsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'audit', element: <AuditJournal /> },
      { path: 'config', element: <Configuration /> },
    ],
  },
  {
    path: '/vice-president',
    element: <VicePresidentLayout />,
    children: [
      // { index: true, element: enConstruction('Dashboard') },
      // { path: 'dashboard', element: enConstruction('Dashboard') },
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> }, 
      { path: 'directions-centrales', element: <DirectionsCentrales /> },
      { path: 'activites', element: <Activites /> },
      { path: 'affectation', element: <AffectationVicePresident /> },
      { path: 'rapports', element: enConstruction('Rapports') },
      ...communs,
    ],
  },
  {
    path: '/directeur-centrale',
    element: <DirecteurCentraleLayout />,
    children: [
      // { index: true, element: enConstruction('Dashboard') },
      // { path: 'dashboard', element: enConstruction('Dashboard') },
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> }, 
      { path: 'directions-centrales', element: <DirectionsCentrales /> },
      { path: 'activites', element: <Activites /> },
      { path: 'directions', element: enConstruction('Directions') },
      { path: 'departements', element: enConstruction('Départements') },
      { path: 'equipe', element: enConstruction('Équipe') },
      { path: 'rapports', element: enConstruction('Rapports') },
      ...communs,
    ],
  },
  {
    path: '/assistant-directeur-centrale',
    element: <AssistantDirecteurCentraleLayout />,
    children: [
      // { index: true, element: enConstruction('Dashboard') },
      // { path: 'dashboard', element: enConstruction('Dashboard') },
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> }, 
      { path: 'directions-centrales', element: <DirectionsCentrales /> },
      { path: 'activites', element: <Activites /> },
      { path: 'directions', element: enConstruction('Directions') },
      { path: 'departements', element: enConstruction('Départements') },
      { path: 'rapports', element: enConstruction('Rapports') },
      ...communs,
    ],
  },
  {
    path: '/directeur-direction',
    element: <DirecteurDirectionLayout />,
    children: [
      // { index: true, element: enConstruction('Dashboard') },
      // { path: 'dashboard', element: enConstruction('Dashboard') },
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> }, 
      { path: 'affectationdep', element: <DepartementAffectations /> },
      { path: 'departements', element: enConstruction('Départements') },
      { path: 'equipe', element: enConstruction('Équipe') },
      { path: 'rapports', element: enConstruction('Rapports') },
      ...communs,
    ],
  },
  {
    path: '/responsable-departement',
    element: <ResponsableDepartementLayout />,
    children: [
      // { index: true, element: enConstruction('Dashboard') },
      // { path: 'dashboard', element: enConstruction('Dashboard') },
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboardres /> }, 

      { path: 'activites', element: <Activites /> },
      { path: 'contrat', element: <ContratsListe /> },
      { path: 'notification', element: <NotificationsPage /> },
      { path: 'equipe', element: enConstruction('Mon Équipe') },
      { path: 'taches', element: enConstruction('Tâches') },
      { path: 'rapports', element: enConstruction('Rapports') },
      ...communs,
    ],
  },
  {
    path: '/directeur-direction-activite',
    element: <DirecteurDirectionActiviteLayout />,
    children: [
      // { index: true, element: enConstruction('Dashboard') },
      // { path: 'dashboard', element: enConstruction('Dashboard') },
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> }, 
      { path: 'activites', element: <Activites /> },
      { path: 'departements', element: enConstruction('Départements') },
      { path: 'equipe', element: enConstruction('Équipe') },
      { path: 'rapports', element: enConstruction('Rapports') },
      ...communs,
    ],
  },
  {
    path: '/directeur-division-activite',
    element: <DirecteurDivisionActiviteLayout />,
    children: [
      // { index: true, element: enConstruction('Dashboard') },
      // { path: 'dashboard', element: enConstruction('Dashboard') },
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> }, 
      // { path: 'structures', element: enConstruction('Structures') },
      { path: 'equipe', element: enConstruction('Équipe') },
      { path: 'rapports', element: enConstruction('Rapports') },
      ...communs,
    ],
  },
  {
    path: '/responsable-direction-division',
    element: <ResponsableDirectionDivisionLayout />,
    children: [
      // { index: true, element: enConstruction('Dashboard') },
      // { path: 'dashboard', element: enConstruction('Dashboard') },
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> }, 
      { path: 'equipe', element: enConstruction('Équipe') },
      { path: 'suivi', element: enConstruction('Suivi') },
      { path: 'rapports', element: enConstruction('Rapports') },
      ...communs,
    ],
  },
  {
    path: '/responsable-departement-division',
    element: <ResponsableDepartementDivisionLayout />,
    children: [
      // { index: true, element: enConstruction('Dashboard') },
      // { path: 'dashboard', element: enConstruction('Dashboard') },
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> }, 
      { path: 'equipe', element: enConstruction('Mon Équipe') },
      { path: 'taches', element: enConstruction('Tâches') },
      { path: 'rapports', element: enConstruction('Rapports') },
      ...communs,
    ],
  },
  {
    path: '/agent',
    element: <AgentLayout />,
    children: [
      // { index: true, element: enConstruction('Dashboard') },
      // { path: 'dashboard', element: enConstruction('Dashboard') },
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> }, 
      { path: 'taches', element: enConstruction('Mes Tâches') },
      { path: 'rapports', element: enConstruction('Rapports') },
      ...communs,
    ],
  },

  {
    path: '*',
    element: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
