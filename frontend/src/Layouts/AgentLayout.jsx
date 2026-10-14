import React from 'react';
import { SidebarLayout, DashboardIcon, ThemesIcon, RapportIcon } from './shared/SidebarLayout';

export const AgentLayout = () => (
  <SidebarLayout
    requiredRole="agent"
    menuSections={[
      {
        label: 'Principal',
        items: [
          { name: 'Dashboard', icon: <DashboardIcon />, path: '/agent/dashboard' },
          { name: 'Mes Tâches', icon: <ThemesIcon />,   path: '/agent/taches' },
          { name: 'Rapports',  icon: <RapportIcon />,   path: '/agent/rapports' },
        ],
      },
    ]}
  />
);