'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { withAuth } from '@/components/ProtectedRoute';
import CreateEventForm, { type CreateEventPayload } from '@/components/host/create/CreateEventForm';

function NewEventPage() {
  const router = useRouter();

  // POST /api/events returns the created event directly, not wrapped in
  // { event }. Errors propagate to the form, which shows them inline with Retry.
  async function create(payload: CreateEventPayload, draft: boolean) {
    const event = await api.post<{ id: string }>('/api/events', payload);
    toast.success(draft ? 'Saved as draft.' : 'Event published!');
    router.push(`/host/events/${event.id}`);
  }

  return <CreateEventForm onSubmit={create} />;
}

export default withAuth(NewEventPage);
