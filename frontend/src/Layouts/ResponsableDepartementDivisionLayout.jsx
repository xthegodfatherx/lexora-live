import React from 'react';
import { SidebarLayout, DashboardIcon, RapportIcon, GroupesIcon, ThemesIcon } from './shared/SidebarLayout';

export const ResponsableDepartementDivisionLayout = () => (
  <SidebarLayout
    requiredRole="responsable_departement_division"
    menuSections={[
      {
        label: 'Principal',
        items: [
          { name: 'Dashboard',  icon: <DashboardIcon />, path: '/responsable-departement-division/dashboard' },
          { name: 'Mon Équipe', icon: <GroupesIcon />,   path: '/responsable-departement-division/equipe' },
          { name: 'Tâches',     icon: <ThemesIcon />,    path: '/responsable-departement-division/taches' },
          { name: 'Rapports',   icon: <RapportIcon />,   path: '/responsable-departement-division/rapports' },
        ],
      },
    ]}
  />
);