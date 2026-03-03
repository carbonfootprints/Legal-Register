import { NavLink } from 'react-router-dom';
import { FiHome, FiFileText, FiArchive, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const navLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/legal-registers', icon: FiFileText, label: 'Legal Registers' },
    { to: '/archived-permits', icon: FiArchive, label: 'Archived Permits' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-60 z-40 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow">
              <FiFileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">{user?.companyName || 'Legal Register'}</span>
          </div>
          <button
            onClick={closeSidebar}
            className="text-slate-400 hover:text-white focus:outline-none lg:hidden"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4">
          <div className="px-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 border-l-2 ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md border-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white border-transparent'
                  }`
                }
              >
                <link.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom version tag */}
        <div className="absolute bottom-4 left-0 right-0 px-5">
          <p className="text-xs text-slate-500 text-center">PCF Legal Register v1.0</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
