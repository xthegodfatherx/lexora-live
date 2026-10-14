import React from 'react';
import { SidebarLayout, DashboardIcon, RapportIcon, GroupesIcon, ThemesIcon ,NotifIcon} from './shared/SidebarLayout';

export const ResponsableDepartementLayout = () => (
  <SidebarLayout
    requiredRole="responsable_departement"
    menuSections={[
      {
        label: 'Principal',
        items: [
          { name: 'Dashboard',  icon: <DashboardIcon />, path: '/responsable-departement/dashboard' },
          { name: 'Mon Équipe', icon: <GroupesIcon />,   path: '/responsable-departement/equipe' },
          { name: 'Tâches',     icon: <ThemesIcon />,    path: '/responsable-departement/taches' },
          { name: 'contrat',  icon: <DashboardIcon />, path: '/responsable-departement/contrat' },
         { name: "notifications", icon: <NotifIcon/>, path: "/responsable-departement/notification" },

          { name: 'Rapports',   icon: <RapportIcon />,   path: '/responsable-departement/rapports' },
        ],
      },
    ]}
  />
);