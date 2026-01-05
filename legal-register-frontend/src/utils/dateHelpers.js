import { format, parseISO, differenceInDays, isValid } from 'date-fns';

export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr) : 'N/A';
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const getDaysUntilRenewal = (renewalDate) => {
  if (!renewalDate) return null;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewal = typeof renewalDate === 'string' ? parseISO(renewalDate) : renewalDate;
    renewal.setHours(0, 0, 0, 0);
    return differenceInDays(renewal, today);
  } catch (error) {
    console.error('Error calculating days until renewal:', error);
    return null;
  }
};

export const getStatusColor = (daysUntilRenewal) => {
  if (daysUntilRenewal === null) return 'gray';
  if (daysUntilRenewal < 0) return 'red'; // Expired
  if (daysUntilRenewal === 0) return 'red'; // Due today
  if (daysUntilRenewal <= 2) return 'orange'; // Due within 2 days
  if (daysUntilRenewal <= 7) return 'yellow'; // Due within a week
  return 'green'; // Safe
};

export const getStatusBadgeClass = (status) => {
  const classes = {
    Active: 'bg-green-100 text-green-800',
    Expired: 'bg-red-100 text-red-800',
    'Pending Renewal': 'bg-yellow-100 text-yellow-800',
    Cancelled: 'bg-gray-100 text-gray-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

export const getRenewalUrgencyBadge = (daysUntilRenewal) => {
  if (daysUntilRenewal === null) return { class: 'bg-gray-100 text-gray-800', label: 'N/A' };
  if (daysUntilRenewal < 0) return { class: 'bg-red-100 text-red-800', label: 'Overdue' };
  if (daysUntilRenewal === 0) return { class: 'bg-red-100 text-red-800', label: 'Due Today' };
  if (daysUntilRenewal === 1) return { class: 'bg-red-100 text-red-800', label: '1 day' };
  if (daysUntilRenewal <= 2) return { class: 'bg-orange-100 text-orange-800', label: `${daysUntilRenewal} days` };
  if (daysUntilRenewal <= 7) return { class: 'bg-yellow-100 text-yellow-800', label: `${daysUntilRenewal} days` };
  return { class: 'bg-green-100 text-green-800', label: `${daysUntilRenewal} days` };
};

export const parseInputDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString);
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

export const toISODate = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error converting to ISO date:', error);
    return '';
  }
};
