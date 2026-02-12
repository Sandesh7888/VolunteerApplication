import { getEventStatus } from './formatters';

export const sortEvents = (events, dateKey = 'createdAt') => {
  if (!events) return [];

  return [...events].sort((a, b) => {
    // 1. Calculate Priority (LIVE > UPCOMING > PENDING > COMPLETED)
    const getPriority = (event) => {
      // If it's a volunteer participation record, check that status first
      if (event.participationStatus && event.participationStatus !== 'APPROVED') {
        return 10; // Low priority for completed/rejected history
      }

      const status = event.status === 'PUBLISHED' || event.status === 'APPROVED' 
        ? getEventStatus(event.startDate, event.endDate, event.startTime, event.endTime, event.status)
        : event.status;

      switch (status) {
        case 'LIVE': return 1;
        case 'UPCOMING': return 2;
        case 'ONGOING': return 2;
        case 'PENDING': return 3; // For approval queues
        case 'PENDING_APPROVAL': return 3;
        case 'DRAFT': return 4;
        case 'COMPLETED': return 5;
        case 'ATTENDED': return 5;
        case 'CANCELLED': return 6;
        case 'REJECTED': return 6;
        case 'REMOVED': return 6;
        default: return 99;
      }
    };

    const priorityA = getPriority(a);
    const priorityB = getPriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // 2. Secondary Sort: Context Aware
    // If priority is UPCOMING (2) or LIVE (1) or PENDING (3), we generally want SOONEST first (Ascending)
    // If priority is COMPLETED (5) or others, we want NEWEST first (Descending)
    
    // Default key to startDate if not provided, but allow override
    const key = dateKey === 'createdAt' ? 'startDate' : dateKey; 
    
    const timeA = new Date(a[key] || a.startDate || 0).getTime();
    const timeB = new Date(b[key] || b.startDate || 0).getTime();

    // Upcoming/Live/Pending -> Ascending (Nearest first)
    if (priorityA <= 3) {
        return timeA - timeB;
    } 
    
    // Completed/Cancelled -> Descending (Most recent first)
    return timeB - timeA;
  });
};
