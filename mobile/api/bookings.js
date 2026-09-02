import { apiRequest } from './client';

export function createBooking({ bookableType, bookableId, fitnessClassId, scheduledAt, notes }) {
  return apiRequest('/bookings', {
    method: 'POST',
    body: {
      bookable_type: bookableType,
      bookable_id: bookableId,
      fitness_class_id: fitnessClassId ?? undefined,
      scheduled_at: scheduledAt ?? undefined,
      notes: notes || undefined,
    },
  });
}

export function fetchMyBookings() {
  return apiRequest('/bookings/mine');
}
