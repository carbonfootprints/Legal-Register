import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import legalRegisterService from '../../services/legalRegisterService';
import Loader from '../common/Loader';
import { getDaysUntilRenewal, formatDate } from '../../utils/dateHelpers';
import logger from '../../utils/logger';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ALERT_COLORS = {
  red: {
    badge: 'bg-red-100 text-red-800',
    border: 'border-red-500',
    bg: 'bg-red-50',
    dateBadge: 'bg-red-200 text-red-800',
    heading: 'text-red-700',
  },
  orange: {
    badge: 'bg-orange-100 text-orange-800',
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    dateBadge: 'bg-orange-200 text-orange-800',
    heading: 'text-orange-700',
  },
  yellow: {
    badge: 'bg-yellow-100 text-yellow-800',
    border: 'border-yellow-500',
    bg: 'bg-yellow-50',
    dateBadge: 'bg-yellow-200 text-yellow-800',
    heading: 'text-yellow-700',
  },
  gray: {
    badge: 'bg-gray-100 text-gray-800',
    border: 'border-gray-500',
    bg: 'bg-gray-50',
    dateBadge: 'bg-gray-200 text-gray-800',
    heading: 'text-gray-700',
  },
};

const AlertSection = ({ title, color, items, renderExtra }) => {
  const c = ALERT_COLORS[color];
  return (
    <div className="mb-6">
      <h3 className={`text-md font-medium ${c.heading} mb-3 flex items-center`}>
        <span className={`${c.badge} px-2 py-1 rounded-md text-sm mr-2`}>{title}</span>
        ({items.length})
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item._id} className={`border-l-4 ${c.border} ${c.bg} p-3 rounded`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{item.permit}</p>
                <p className="text-sm text-gray-600">Document No: {item.documentNo}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs ${c.dateBadge} px-2 py-1 rounded block mb-1`}>
                  {formatDate(item.dueDateForRenewal)}
                </span>
                {renderExtra && (
                  <span className="text-xs text-gray-600">{renderExtra(item)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, alertsResponse] = await Promise.all([
        legalRegisterService.getStatistics(),
        legalRegisterService.getExpiryAlerts(),
      ]);

      if (statsResponse.success) setStats(statsResponse.data);
      if (alertsResponse.success) setAlerts(alertsResponse.data);
    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return <Loader />;
  }

  const statCards = [
    {
      label: 'Total Permits',
      value: stats?.total || 0,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Active',
      value: stats?.active || 0,
      gradient: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      label: 'Expiring Soon',
      value: stats?.expiringSoon || 0,
      gradient: 'from-amber-400 to-yellow-500',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Overdue',
      value: stats?.overdue || 0,
      gradient: 'from-red-500 to-rose-500',
      bg: 'bg-red-50',
      border: 'border-red-100',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  ];

  const totalAlerts =
    (alerts?.dueToday?.length || 0) +
    (alerts?.dueTwoDays?.length || 0) +
    (alerts?.dueWeek?.length || 0) +
    (alerts?.expired?.length || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <button
            key={card.label}
            onClick={() => navigate('/legal-registers')}
            className={`bg-white overflow-hidden shadow-sm rounded-xl border ${card.border} text-left hover:shadow-md transition-shadow w-full cursor-pointer`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`flex-shrink-0 bg-gradient-to-br ${card.gradient} rounded-xl p-3 shadow-sm`}>
                  {card.icon}
                </div>
              </div>
            </div>
            <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
          </button>
        ))}
      </div>

      {/* Expiry Alerts */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Renewal Alerts</h2>
          {totalAlerts > 0 && (
            <span className="text-xs bg-red-100 text-red-700 font-medium px-2.5 py-1 rounded-full">
              {totalAlerts} {totalAlerts === 1 ? 'item needs' : 'items need'} attention
            </span>
          )}
        </div>

        {alerts?.dueToday?.length > 0 && (
          <AlertSection title="Due Today" color="red" items={alerts.dueToday} />
        )}

        {alerts?.dueTwoDays?.length > 0 && (
          <AlertSection title="Due in 2 Days" color="orange" items={alerts.dueTwoDays} />
        )}

        {alerts?.dueWeek?.length > 0 && (
          <AlertSection
            title="Due This Week"
            color="yellow"
            items={alerts.dueWeek}
            renderExtra={(item) => {
              const days = getDaysUntilRenewal(item.dueDateForRenewal);
              return `${days} days`;
            }}
          />
        )}

        {alerts?.expired?.length > 0 && (
          <AlertSection
            title="Expired"
            color="gray"
            items={alerts.expired}
            renderExtra={(item) => {
              const days = Math.abs(getDaysUntilRenewal(item.dueDateForRenewal));
              return <span className="text-red-600">{days} days overdue</span>;
            }}
          />
        )}

        {totalAlerts === 0 && (
          <div className="text-center py-10">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">All permits are up to date</p>
            <p className="text-sm text-gray-400 mt-1">No renewal alerts at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
