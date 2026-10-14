import React from 'react';
import { SidebarLayout, DashboardIcon, OrganisationIcon, RapportIcon,ChainIcon } from './shared/SidebarLayout';

export const VicePresidentLayout = () => (
  <SidebarLayout
    requiredRole="vice_presedent"
    menuSections={[
      {
        label: 'Principal',
        items: [
          { name: 'Dashboard',   icon: <DashboardIcon />,   path: '/vice-president/dashboard' },
          { name: 'Rapports',    icon: <RapportIcon />,     path: '/vice-president/rapports' },
              { name: "Affectations", icon: <ChainIcon />, path: "/vice-president/affectation" },
          
        ],
      },
      {
        label: 'Organisation',
        items: [
          { name: 'Directions Centrales', icon: <OrganisationIcon />, path: '/vice-president/directions-centrales' },
          { name: 'Activités',            icon: <OrganisationIcon />, path: '/vice-president/activites' },
        ],
      },
    ]}
  />
);