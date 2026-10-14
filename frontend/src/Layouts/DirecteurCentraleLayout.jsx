import React from 'react';
import { SidebarLayout, DashboardIcon, OrganisationIcon, RapportIcon, GroupesIcon } from './shared/SidebarLayout';

export const DirecteurCentraleLayout = () => (
  <SidebarLayout
    requiredRole="directeur_centrale"
    menuSections={[
      {
        label: 'Principal',
        items: [
          { name: 'Dashboard', icon: <DashboardIcon />, path: '/directeur-centrale/dashboard' },
          { name: 'Rapports',  icon: <RapportIcon />,   path: '/directeur-centrale/rapports' },
        ],
      },
      {
        label: 'Ma Direction Centrale',
        items: [
          { name: 'Directions',   icon: <OrganisationIcon />, path: '/directeur-centrale/directions' },
          { name: 'Départements', icon: <OrganisationIcon />, path: '/directeur-centrale/departements' },
          { name: 'Équipe',       icon: <GroupesIcon />,       path: '/directeur-centrale/equipe' },
        ],
      },
    ]}
  />
);