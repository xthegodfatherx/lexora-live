import React from 'react';
import { SidebarLayout, DashboardIcon, OrganisationIcon, RapportIcon } from './shared/SidebarLayout';

export const AssistantDirecteurCentraleLayout = () => (
  <SidebarLayout
    requiredRole="assistant_directeur_centrale"
    menuSections={[
      {
        label: 'Principal',
        items: [
          { name: 'Dashboard', icon: <DashboardIcon />, path: '/assistant-directeur-centrale/dashboard' },
          { name: 'Rapports',  icon: <RapportIcon />,   path: '/assistant-directeur-centrale/rapports' },
        ],
      },
      {
        label: 'Direction Centrale',
        items: [
          { name: 'Directions',   icon: <OrganisationIcon />, path: '/assistant-directeur-centrale/directions' },
          { name: 'Départements', icon: <OrganisationIcon />, path: '/assistant-directeur-centrale/departements' },
        ],
      },
    ]}
  />
);