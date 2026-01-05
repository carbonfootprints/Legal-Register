import { NavLink } from 'react-router-dom';
import { FiHome, FiFileText, FiX } from 'react-icons/fi';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/legal-registers', icon: FiFileText, label: 'Legal Registers' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b lg:hidden">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={closeSidebar}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6">
          <div className="px-4 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <link.icon className="mr-3 h-5 w-5" />
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
