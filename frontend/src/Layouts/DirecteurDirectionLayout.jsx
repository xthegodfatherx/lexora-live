import React from 'react';
import { SidebarLayout, DashboardIcon, OrganisationIcon, RapportIcon, GroupesIcon } from './shared/SidebarLayout';
import { ReactComponent as ChainIcon } from "../Assets/Icons/Affectation.svg";


export const DirecteurDirectionLayout = () => (
  <SidebarLayout
    requiredRole="directeur_direction"
    menuSections={[
      {
        label: 'Principal',
        items: [
          { name: 'Dashboard', icon: <DashboardIcon />, path: '/directeur-direction/dashboard' },
          { name: 'Rapports',  icon: <RapportIcon />,   path: '/directeur-direction/rapports' },
        ],
      },
      {
        label: 'Ma Direction',
        items: [
         { name: "Affectations", icon: <ChainIcon />, path: "/directeur-direction/affectationdep" },
            
          { name: 'Départements', icon: <OrganisationIcon />, path: '/directeur-direction/departements' },
          { name: 'Équipe',       icon: <GroupesIcon />,       path: '/directeur-direction/equipe' },
        ],
      },
    ]}
  />
);