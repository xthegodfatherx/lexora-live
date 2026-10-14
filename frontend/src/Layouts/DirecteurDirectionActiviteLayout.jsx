import React from 'react';
import { SidebarLayout, DashboardIcon, OrganisationIcon, RapportIcon, GroupesIcon } from './shared/SidebarLayout';

export const DirecteurDirectionActiviteLayout = () => (
  <SidebarLayout
    requiredRole="directeur_direction_activite"
    menuSections={[
      {
        label: 'Principal',
        items: [
          { name: 'Dashboard', icon: <DashboardIcon />, path: '/directeur-direction-activite/dashboard' },
          { name: 'Rapports',  icon: <RapportIcon />,   path: '/directeur-direction-activite/rapports' },
        ],
      },
      {
        label: 'Mon Activité',
        items: [
          { name: 'Départements', icon: <OrganisationIcon />, path: '/directeur-direction-activite/departements' },
          { name: 'Équipe',       icon: <GroupesIcon />,       path: '/directeur-direction-activite/equipe' },
        ],
      },
    ]}
  />
);