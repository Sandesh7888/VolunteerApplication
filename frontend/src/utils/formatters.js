export const formatTime = (timeString) => {
  if (!timeString) return 'TBD';
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (err) {
    return timeString;
  }
};

export const getEventStatus = (startDate, endDate, startTime, endTime, dbStatus) => {
  // 1. DB Status Override (Cancelled, Draft, Rejected, etc.)
  if (dbStatus === 'CANCELLED' || dbStatus === 'REJECTED' || dbStatus === 'DRAFT' || dbStatus === 'PENDING_APPROVAL') {
    return dbStatus;
  }

  // 2. Strict Time-Based Logic for LIVE/COMPLETED
  const now = new Date();
  
  // Parse Start Date & Time
  const start = new Date(startDate);
  if (startTime) {
    const [h, m] = startTime.split(':');
    start.setHours(parseInt(h), parseInt(m), 0, 0);
  } else {
    start.setHours(0, 0, 0, 0);
  }
  
  // Parse End Date & Time
  let end;
  if (endDate) {
    end = new Date(endDate);
  } else {
    end = new Date(startDate); // Default to same day if no end date
  }

  if (endTime) {
    const [h, m] = endTime.split(':');
    end.setHours(parseInt(h), parseInt(m), 59, 999);
  } else {
    end.setHours(23, 59, 59, 999);
  }

  // Debug logs (can be removed later)
  // console.log(`Checking Status for: ${startDate} ${startTime} - ${endDate} ${endTime}`);
  // console.log(`Now: ${now}`);
  // console.log(`Start: ${start}`);
  // console.log(`End: ${end}`);

  if (now < start) return 'UPCOMING';
  if (now >= start && now <= end) return 'LIVE'; 
  return 'COMPLETED';
};
