import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import TopBar from '../../Components/Partials/Components/TopBar';
import { ReactComponent as DashboardIcon }    from '../../Assets/Icons/dash.svg';
import { ReactComponent as OrganisationIcon } from '../../Assets/Icons/param.svg';
import { ReactComponent as ChainIcon }        from '../../Assets/Icons/Affectation.svg';
import { ReactComponent as ProfileIcon }      from '../../Assets/Icons/profile.svg';
import { ReactComponent as NotifIcon }        from '../../Assets/Icons/notif.svg';
import { ReactComponent as AuditIcon }        from '../../Assets/Icons/rapport.svg';
import { ReactComponent as SettingIcon }      from '../../Assets/Icons/setting-2.svg';
import { ReactComponent as DeconnexionIcon }  from '../../Assets/Icons/logout.svg';
import { ReactComponent as GroupesIcon }      from '../../Assets/Icons/equipe.svg';
import { ReactComponent as RapportIcon }      from '../../Assets/Icons/rapport.svg';
import { ReactComponent as ThemesIcon }       from '../../Assets/Icons/projetctl.svg';

/**
 * SidebarLayout — layout générique partagé par tous les rôles.
 *
 * Props:
 *   requiredRole  {string|string[]}  rôle(s) autorisé(s)
 *   menuSections  {Array}            sections du menu
 *     [{ label, items: [{ name, icon, path }] }]
 */
export const SidebarLayout = ({ requiredRole, menuSections = [] }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [nomComplet, setNomComplet]     = useState('');
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setNomComplet(localStorage.getItem('nom_complet') || '');
    const role = localStorage.getItem('role');
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(role)) navigate('/unauthorized');
  }, [navigate, requiredRole]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    if (!window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) return;
    setIsLoggingOut(true);
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) await axiosInstance.post('/auth/logout/', { refresh });
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.clear();
      delete axiosInstance.defaults.headers['Authorization'];
      navigate('/login');
      setIsLoggingOut(false);
    }
  };

  const renderItem = (item, key) => (
    <NavLink
      key={key}
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
          <span className={`w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current ${isActive ? 'text-orange-600' : 'text-gray-700'}`}>
            {item.icon}
          </span>
          <span className="text-sm font-medium">{item.name}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-screen">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-[260px] bg-white text-gray-800 h-screen flex flex-col border-r border-gray-200 shadow-lg transform transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">
              <span className="text-[#FF8500]">SONATRACH</span>
              <span className="text-gray-800">Budget</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 truncate">{nomComplet}</p>
          </div>
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

        <nav className="flex-1 overflow-y-auto scrollbar-hidden">
          {menuSections.map((section, si) => (
            <div key={si} className="flex flex-col py-2 mt-2">
              {section.label && (
                <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.label}
                </div>
              )}
              {section.items.map((item, ii) => renderItem(item, `${si}-${ii}`))}
            </div>
          ))}

          {/* Paramètres communs */}
          <div className="flex flex-col py-2 mt-2">
            <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Paramètres
            </div>
            {[
              { name: 'DER',              icon: <RapportIcon />, path: 'der' },
              { name: 'Arbitrage',        icon: <RapportIcon />, path: 'arbitrage' },
              { name: 'Profile',          icon: <ProfileIcon />, path: 'profile' },
              { name: 'Notifications',    icon: <NotifIcon />,   path: 'notifications' },
            ].map((item, i) => renderItem(item, `param-${i}`))}
          </div>
        </nav>

        <div className="border-t border-gray-200 pt-2 pb-4">
          <button
            onClick={() => { setSidebarOpen(false); handleLogout(); }}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-6 py-3 w-full text-gray-600 hover:bg-[#FF8500] hover:text-white transition-all duration-200 disabled:opacity-50"
          >
            <span className="w-5 h-5"><DeconnexionIcon /></span>
            <span className="text-sm font-medium">
              {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
            </span>
          </button>
        </div>
      </aside>

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

      <style>{`.scrollbar-hidden{scrollbar-width:none;-ms-overflow-style:none;}.scrollbar-hidden::-webkit-scrollbar{display:none;}`}</style>
    </div>
  );
};

// ─── Export des icônes pour réutilisation dans les layouts ──────────────────
export { DashboardIcon, OrganisationIcon, ChainIcon, ProfileIcon, NotifIcon, AuditIcon, SettingIcon, GroupesIcon, RapportIcon, ThemesIcon };