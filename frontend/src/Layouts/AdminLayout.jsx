// AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import axiosInstance from "../axios";
import { ReactComponent as DashboardIcon } from "../Assets/Icons/dash.svg";

import { ReactComponent as GroupesIcon } from "../Assets/Icons/equipe.svg";
import { ReactComponent as ChainIcon } from "../Assets/Icons/Affectation.svg";

import { ReactComponent as SettingIcon } from "../Assets/Icons/setting-2.svg";
import { ReactComponent as ProfileIcon } from "../Assets/Icons/profile.svg";
import { ReactComponent as NotifIcon } from "../Assets/Icons/notif.svg";
import { ReactComponent as DeconxxionIcon } from "../Assets/Icons/logout.svg";
import { ReactComponent as AuditIcon } from "../Assets/Icons/rapport.svg";
import { ReactComponent as OrganisationIcon } from "../Assets/Icons/param.svg";
// import { ReactComponent as BibIcon } from "../Assets/Icons/bib.png";

import TopBar from "../Components/Partials/Components/TopBar";

export const AdminLayout = () => {
  const [activeMainMenu, setActiveMainMenu] = useState("Dashboard");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [adminInfo, setAdminInfo] = useState({});
  const [openDropdown, setOpenDropdown] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const nomComplet = localStorage.getItem('nom_complet');
    setAdminInfo({ nomComplet });
    
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/unauthorized');
    }
  }, [navigate]);

  const toggleDropdown = (menuName) => {
    setOpenDropdown(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const mainMenuItems = [
    { name: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { name: "Utilisateurs", icon: <GroupesIcon />, path: "/admin/utilisateurs" },
    { name: "Affectations", icon: <ChainIcon />, path: "/admin/affectation" },
    { name: "notifications", icon: <NotifIcon  />, path: "/admin/notification" },

  ];

  // const projectMenuItems = [
  //   { name: "Projets", icon: <ThemesIcon />, path: "/admin/projets" },
  //   { name: "Comparaison projet", icon: <ThemesIcon />, path: "/admin/comparison" },
  //   { name: "Recap", icon: <ThemesIcon />, path: "/admin/recap" },
  //   { name: "Classification", icon: <ClassificationIcon />, path: "/admin/classification" },
  //   { name: "Risque Analyse", icon: <RisqueIcon />, path: "/admin/risque" },
  //   { name: "Rapport", icon: <RapportIcon />, path: "/admin/rapport" },
  // ];

  // Nouveau menu Organisation avec sous-menus
  const organisationMenuItems = [
    { 
      name: "Directions Centrales", 
      icon: <OrganisationIcon />, 
      path: "/admin/directions-centrales",
      // description: "Gestion des directions centrales"
    },
    { 
      name: "Activités", 
      icon: <OrganisationIcon />, 
      path: "/admin/activites",
      // description: "Gestion des activités"
    },
     { 
      name: "Bib-juridique", 
      icon: <OrganisationIcon />, 
      path: "/admin/bib",
      // description: "Gestion des activités"
    },
    {
      name: "DER",
      icon: <AuditIcon />,
      path: "/admin/der",
    },
    {
      name: "Arbitrage",
      icon: <AuditIcon />,
      path: "/admin/arbitrage",
    },
  ];



  const otherSettingsItems = [
    { name: "Profile", icon: <ProfileIcon />, path: "/admin/profile" },
    { name: "Notification", icon: <NotifIcon />, path: "/admin/notification" },
    { name: "Journal d'audit", icon: <AuditIcon />, path: "/admin/audit" },
    { name: "Configuration", icon: <SettingIcon />, path: "/admin/config" },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    if (!window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      return;
    }
    
    setIsLoggingOut(true);
    
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await axiosInstance.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      localStorage.clear();
      delete axiosInstance.defaults.headers['Authorization'];
      navigate('/login');
      setIsLoggingOut(false);
    }
  };

  const renderMenuItem = (item, index) => (
    <NavLink
      key={index}
      to={item.path}
      onClick={() => { setActiveMainMenu(item.name); setSidebarOpen(false); }}
      className={({ isActive }) =>
        `flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-[#FF8500] hover:text-white transition-all duration-200 ${
          isActive || activeMainMenu === item.name ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500' : ''
        }`
      }
      end
    >
      {({ isActive }) => (
        <>
          <span className={`w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current ${
            isActive || activeMainMenu === item.name ? 'text-orange-600' : 'text-gray-700'
          }`}>
            {item.icon}
          </span>
          <span className="text-sm font-medium">{item.name}</span>
        </>
      )}
    </NavLink>
  );

  const DropdownMenuItem = ({ title, icon, items }) => {
    const isOpen = openDropdown[title];
    
    return (
      <div>
        <div
          className="flex items-center justify-between px-6 py-3 text-gray-600 hover:bg-[#FF8500] hover:text-white transition-all duration-200 cursor-pointer"
          onClick={() => toggleDropdown(title)}
        >
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current text-gray-700">
              {icon}
            </span>
            <span className="text-sm font-medium">{title}</span>
          </div>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {isOpen && (
          <div className="ml-4">
            {items.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.path}
                onClick={() => { setActiveMainMenu(item.name); setSidebarOpen(false); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-2.5 text-gray-500 hover:bg-[#FF8500] hover:text-white transition-all duration-200 ${
                    isActive || activeMainMenu === item.name ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500' : ''
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current ${
                      isActive || activeMainMenu === item.name ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-screen">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-[260px] bg-white text-gray-800 h-screen flex flex-col border-r border-gray-200 shadow-lg transform transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between">
          <h2 className="text-xl font-bold">
            <span className="text-[#FF8500]">SONATRACH</span>
            <span className="text-gray-800">LEXORA</span>
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-gray-500 hover:text-gray-700"
            aria-label="Fermer le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hidden">
          
          {/* Menu Principal */}
          <div className="flex flex-col py-2">
            <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Principal
            </div>
            {mainMenuItems.map((item, idx) => renderMenuItem(item, idx))}
          </div>

          {/* Section Organisation */}
          <div className="flex flex-col py-2 mt-2">
            <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Organisation
            </div>
            {organisationMenuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-[#FF8500] hover:text-white transition-all duration-200 ${
                    isActive ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500' : ''
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="w-5 h-5">
                      <OrganisationIcon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
                    </span>
                    <div className="flex-1">
                      <span className="text-sm font-medium block">{item.name}</span>
                      <span className="text-xs text-gray-400">{item.description}</span>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </div>

       
       
          {/* Section Paramètres */}
          <div className="flex flex-col py-2 mt-2">
            <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Paramètres
            </div>
         
            {otherSettingsItems.map((item, idx) => renderMenuItem(item, `other-${idx}`))}
          </div>

          {/* Déconnexion */}
          <div className="flex flex-col py-2 mt-auto border-t border-gray-200 pt-4">
            <button
              onClick={() => { setSidebarOpen(false); handleLogout(); }}
              disabled={isLoggingOut}
              className={`flex items-center gap-3 px-6 py-3 w-full text-left text-gray-600 hover:bg-[#FF8500] hover:text-white transition-all duration-200 ${
                isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                <DeconxxionIcon className="w-5 h-5 text-gray-600" />
              </span>
              <span className="text-sm font-medium">
                {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
              </span>
              {isLoggingOut && (
                <svg className="animate-spin h-4 w-4 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>
          </div>
        </nav>
      </aside>

      {/* Content */}
      <div className="bg-gray-50 flex flex-col min-w-0">
        <header className="bg-white sticky top-0 z-20 shadow-sm flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 ml-3 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Ouvrir le menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <TopBar />
          </div>
        </header>
        <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <style jsx>{`
        .scrollbar-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};