/**
 * Status color utility for consistent UI styling
 */

export type ApplicationStatus = 
  | 'pending' 
  | 'reviewed' 
  | 'shortlisted' 
  | 'interview_scheduled' 
  | 'interview_completed' 
  | 'rejected' 
  | 'offer_made' 
  | 'visa_ready';

interface StatusColor {
  bg: string;
  text: string;
  border: string;
  badge: string;
}

export const getStatusColor = (status: ApplicationStatus): StatusColor => {
  const statusMap: Record<ApplicationStatus, StatusColor> = {
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-700'
    },
    reviewed: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700'
    },
    shortlisted: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-700'
    },
    interview_scheduled: {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-700'
    },
    interview_completed: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-700'
    },
    rejected: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700'
    },
    offer_made: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700'
    },
    visa_ready: {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      badge: 'bg-teal-100 text-teal-700'
    }
  };

  return statusMap[status] || statusMap.pending;
};

export const getStatusLabel = (status: ApplicationStatus): string => {
  const labelMap: Record<ApplicationStatus, string> = {
    pending: 'Pending Review',
    reviewed: 'Under Review',
    shortlisted: 'Shortlisted',
    interview_scheduled: 'Interview Scheduled',
    interview_completed: 'Interview Completed',
    rejected: 'Rejected',
    offer_made: 'Offer Made',
    visa_ready: 'Visa Ready'
  };

  return labelMap[status] || 'Unknown Status';
};

export const getProgressPercentage = (status: ApplicationStatus): number => {
  const progressMap: Record<ApplicationStatus, number> = {
    pending: 20,
    reviewed: 40,
    shortlisted: 60,
    interview_scheduled: 75,
    interview_completed: 85,
    rejected: 0,
    offer_made: 95,
    visa_ready: 100
  };

  return progressMap[status] || 0;
};
