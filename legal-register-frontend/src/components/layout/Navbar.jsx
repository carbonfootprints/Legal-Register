import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none lg:hidden mr-1"
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <span className="text-base font-semibold text-gray-800 hidden sm:block">
                {user?.companyName || 'Legal Register Management'}
              </span>
              <span className="text-base font-semibold text-gray-800 sm:hidden">
                {user?.companyName ? user.companyName.split(' ')[0] : 'Legal Register'}
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center text-sm focus:outline-none"
              >
                <div className="flex items-center bg-emerald-50 border border-emerald-100 rounded-full pl-2 pr-3 py-1.5 hover:bg-emerald-100 transition-colors">
                  <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mr-2 shadow-sm">
                    <FiUser className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium text-sm hidden sm:block">{user?.name}</span>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
