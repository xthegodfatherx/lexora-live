import React from 'react';
import { SidebarLayout, DashboardIcon, OrganisationIcon, RapportIcon, GroupesIcon } from './shared/SidebarLayout';

export const DirecteurDivisionActiviteLayout = () => (
  <SidebarLayout
    requiredRole="directeur_division_activite"
    menuSections={[
      {
        label: 'Principal',
        items: [
          { name: 'Dashboard', icon: <DashboardIcon />, path: '/directeur-division-activite/dashboard' },
          { name: 'Rapports',  icon: <RapportIcon />,   path: '/directeur-division-activite/rapports' },
        ],
      },
      {
        label: 'Ma Division',
        items: [
          { name: 'Structures', icon: <OrganisationIcon />, path: '/directeur-division-activite/structures' },
          { name: 'Équipe',     icon: <GroupesIcon />,       path: '/directeur-division-activite/equipe' },
        ],
      },
    ]}
  />
);