import React from 'react';
import { SidebarLayout, DashboardIcon, OrganisationIcon, RapportIcon, GroupesIcon } from './shared/SidebarLayout';

export const ResponsableDirectionDivisionLayout = () => (
  <SidebarLayout
    requiredRole="responsable_direction_division"
    menuSections={[
      {
        label: 'Principal',
        items: [
          { name: 'Dashboard', icon: <DashboardIcon />, path: '/responsable-direction-division/dashboard' },
          { name: 'Rapports',  icon: <RapportIcon />,   path: '/responsable-direction-division/rapports' },
        ],
      },
      {
        label: 'Ma Structure',
        items: [
          { name: 'Équipe', icon: <GroupesIcon />,       path: '/responsable-direction-division/equipe' },
          { name: 'Suivi',  icon: <OrganisationIcon />, path: '/responsable-direction-division/suivi' },
        ],
      },
    ]}
  />
);