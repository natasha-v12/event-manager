'use client';
import React, { useEffect, useState } from 'react';
import { FiEdit, FiPlus } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { updateEvent, deleteEvent, createEvent } from '../app/actions/events';
import Spinner from './ui/spinner';
import { showToast } from '../lib/toast';
import { Form, FormField, FormControl } from './ui/form';
import Input from './ui/input';
import { Textarea } from './ui/textarea';
import Select from './ui/select';
import Checkbox from './ui/checkbox';
import { Button } from './ui/button';
import { Field, FieldLabel, FieldContent } from './ui/field';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

export default function EditEventDialog({ eventId, initialData, initialSports, initialVenues, initialVenueIds, buttonLabel, buttonClassName }: { eventId?: string, initialData?: any, initialSports?: any[], initialVenues?: any[], initialVenueIds?: string[], buttonLabel?: string, buttonClassName?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(initialData ?? null);

  const [sports, setSports] = useState<any[]>(initialSports ?? []);
  const [venues, setVenues] = useState<any[]>(initialVenues ?? []);
  const [venueQuery, setVenueQuery] = useState('');

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      sport_id: '',
      date: '',
      time: '',
      end_date: '',
      end_time: '',
      venue_ids: [] as string[],
    },
  });

  const watchedVenueIds: string[] = form.watch('venue_ids') || [];
  const watchedSportId: string = form.watch('sport_id') || '';
  const isEditing = Boolean((eventId && String(eventId).trim() !== '') || (data?.event?.id));

  const router = useRouter();

  useEffect(() => {
    // if parent provided initialData, populate form values from it and avoid client fetch
    if (initialData) {
      const ev = initialData.event ?? {};
      const dt = ev.start_time ? new Date(ev.start_time) : null;
        const dtEnd = ev.end_time ? new Date(ev.end_time) : null;
      form.reset({
        name: ev.name ?? '',
        description: ev.description ?? '',
        sport_id: (initialData.sport?.id ?? ev.sport_id) || '',
          date: dt ? dt.toISOString().slice(0,10) : '',
          time: dt ? dt.toTimeString().slice(0,5) : '',
          end_date: dtEnd ? dtEnd.toISOString().slice(0,10) : '',
          end_time: dtEnd ? dtEnd.toTimeString().slice(0,5) : '',
        venue_ids: initialVenueIds ?? (initialData.venues?.map((v:any)=>String(v.id)) ?? []),
      });
      // set provided lists, but if empty, fall back to fetching on client
      if (initialSports && initialSports.length > 0) setSports(initialSports);
      if (initialVenues && initialVenues.length > 0) setVenues(initialVenues);
      // if either list is missing/empty, fallthrough to allow client fetch when dialog opens
      if ((initialSports && initialSports.length > 0) && (initialVenues && initialVenues.length > 0)) return;
    }

    if (!open) return;
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        const json = await res.json();
        if (!mounted) return;
        setData(json);
        const ev = json.event ?? {};
        const dt = ev.start_time ? new Date(ev.start_time) : null;
        const dtEnd = ev.end_time ? new Date(ev.end_time) : null;
        form.reset({
          name: ev.name ?? '',
          description: ev.description ?? '',
          sport_id: (json.sport?.id ?? ev.sport_id) || '',
          date: dt ? dt.toISOString().slice(0,10) : '',
          time: dt ? dt.toTimeString().slice(0,5) : '',
          end_date: dtEnd ? dtEnd.toISOString().slice(0,10) : '',
          end_time: dtEnd ? dtEnd.toTimeString().slice(0,5) : '',
          venue_ids: (json.venues || []).map((v:any)=>String(v.id)),
        });
        // fetch sports for autocomplete when initialSports not provided or empty
        if (!initialSports || (Array.isArray(initialSports) && initialSports.length === 0)) {
          try {
            const r = await fetch('/api/sports');
            if (r.ok) {
              const list = await r.json();
              setSports(list || []);
            }
          } catch {
            // ignore
          }
        }
        // venues should be provided by server (initialVenues). If not, fallback to API fetch.
        if (!initialVenues || (Array.isArray(initialVenues) && initialVenues.length === 0)) {
          try {
            const r2 = await fetch('/api/venues');
            if (r2.ok) {
              const list = await r2.json();
              if (mounted) setVenues(list || []);
            }
          } catch {
            // ignore
          }
        }
      } catch (e) {
        setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [open, eventId, initialData, initialSports]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      setLoading(true);
      const id = eventId ?? data?.event?.id;
      if (!id) throw new Error('Missing event id');
      await deleteEvent(id);
      setOpen(false);
      try { router.refresh(); } catch { /* ignore */ }
      try { showToast('Event deleted', 'success'); } catch {}
    } catch (err) {
      try { showToast('Failed to delete event', 'error'); } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        aria-label={buttonLabel ?? 'Open event editor'}
        title={buttonLabel ?? 'Edit'}
        className={buttonClassName ?? "inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"}
      >
        {buttonLabel && buttonLabel.toLowerCase().includes('add') ? <FiPlus size={16} /> : <FiEdit size={16} />}
        <span className="hidden sm:inline font-medium">{buttonLabel ?? 'Edit'}</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded bg-white text-gray-900 p-6 shadow-lg">
            <div className="flex items-start justify-between bg-gray-50 p-4 rounded-t-md">
              <h3 className="text-lg font-semibold !text-gray-900">Event Editor</h3>
            </div>

            <div className="mt-4">
              {loading && (
                <div className="flex items-center gap-2">
                  <Spinner size={20} />
                  <span className="text-sm text-gray-600">Loading…</span>
                </div>
              )}
              {!loading && !data && !initialData && <div className="text-sm text-gray-600">No data</div>}

              {!loading && (data || initialData) && (
                <Form form={form} onSubmit={form.handleSubmit(async (values) => {
                  try {
                    setLoading(true);
                    const payload: any = { name: values.name, description: values.description };
                    if (values.sport_id) payload.sport_id = values.sport_id;
                    if (values.venue_ids && values.venue_ids.length) payload.venue_ids = values.venue_ids;
                    if (values.date) {
                      const timePart = values.time || '00:00';
                      payload.start_time = new Date(`${values.date}T${timePart}`).toISOString();
                    }
                      // include end_time when provided. If end_date missing but end_time present, use start date.
                      if (values.end_date) {
                        const endPart = values.end_time || '00:00';
                        payload.end_time = new Date(`${values.end_date}T${endPart}`).toISOString();
                      } else if (values.end_time && values.date) {
                        payload.end_time = new Date(`${values.date}T${values.end_time}`).toISOString();
                      }
                    const id = eventId ?? data?.event?.id;
                    if (id) {
                      await updateEvent(id, payload);
                    } else {
                      // create new event
                      await createEvent(payload);
                    }
                    setOpen(false);
                    try { router.refresh(); } catch { /* ignore */ }
                    try { showToast('Event saved', 'success'); } catch {}
                  } catch (err) {
                    try { showToast('Failed to save event', 'error'); } catch {}
                  } finally {
                    setLoading(false);
                  }
                })} className="grid grid-cols-1 gap-4">
                  <input type="hidden" name="event_id" value={eventId ?? data?.event?.id} />
                  <div>
                    <Field>
                      <FieldLabel>Sport</FieldLabel>
                      <FieldContent>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full text-left">
                              {(sports || []).find((s:any) => String(s.id) === String(watchedSportId))?.name ?? 'Select sport'}
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent className="w-full mt-1 p-0 max-h-60 overflow-auto bg-white border border-gray-200 rounded-md">
                            {(sports || []).map((s: any) => (
                              <DropdownMenuItem
                                key={s.id}
                                onClick={() => form.setValue('sport_id', String(s.id))}
                                className="w-full px-3 py-2 text-sm text-gray-900 hover:bg-gray-100"
                              >
                                {s.name}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => form.setValue('sport_id', '')} className="w-full px-3 py-2 text-sm text-gray-900 hover:bg-gray-100">Clear</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </FieldContent>
                    </Field>
                  </div>

                  <div>
                    <Field>
                      <FieldLabel>Event Name</FieldLabel>
                      <FieldContent>
                        <FormField name="name" form={form} render={({ field }) => (
                          <Input {...field} />
                        )} />
                      </FieldContent>
                    </Field>
                  </div>

                  <div>
                    <Field>
                      <FieldLabel>Description</FieldLabel>
                      <FieldContent>
                        <FormField name="description" form={form} render={({ field }) => (
                          <Textarea {...field} rows={4} />
                        )} />
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Field>
                        <FieldLabel>Start Date</FieldLabel>
                        <FieldContent>
                          <FormField name="date" form={form} render={({ field }) => (
                            <Input type="date" {...field} />
                          )} />
                        </FieldContent>
                      </Field>
                    </div>
                    <div>
                      <Field>
                        <FieldLabel>Start Time</FieldLabel>
                        <FieldContent>
                          <FormField name="time" form={form} render={({ field }) => (
                            <Input type="time" {...field} />
                          )} />
                        </FieldContent>
                      </Field>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Field>
                        <FieldLabel>End Date</FieldLabel>
                        <FieldContent>
                          <FormField name="end_date" form={form} render={({ field }) => (
                            <Input type="date" {...field} />
                          )} />
                        </FieldContent>
                      </Field>
                    </div>
                    <div>
                      <Field>
                        <FieldLabel>End Time</FieldLabel>
                        <FieldContent>
                          <FormField name="end_time" form={form} render={({ field }) => (
                            <Input type="time" {...field} />
                          )} />
                        </FieldContent>
                      </Field>
                    </div>
                  </div>

                  <div>
                    <Field>
                      <FieldLabel>Venues</FieldLabel>
                      <FieldContent>
                        <div className="mt-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {(watchedVenueIds || []).map((vid: string) => {
                            const v = (venues || []).find((x: any) => String(x.id) === String(vid));
                            return (
                              <span key={vid} className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                                <span>{v?.name ?? vid}</span>
                                    <Button type="button" variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 p-0" aria-label={`Remove venue ${vid}`} onClick={() => {
                                      const cur = form.getValues('venue_ids') || [];
                                      form.setValue('venue_ids', cur.filter((x: string) => String(x) !== String(vid)));
                                    }}>×</Button>
                              </span>
                            );
                          })}
                        </div>

                        <div className="relative">
                          <Input
                            type="text"
                            value={venueQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVenueQuery(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const q = venueQuery.trim().toLowerCase();
                                if (!q) return;
                                const match = (venues || []).find((x: any) => x.name.toLowerCase().includes(q));
                                if (match) {
                                  const cur = form.getValues('venue_ids') || [];
                                  const vid = String(match.id);
                                  if (!cur.includes(vid)) form.setValue('venue_ids', [...cur, vid]);
                                  setVenueQuery('');
                                }
                              }
                            }}
                            placeholder="Search and press Enter to add"
                            className="w-full"
                          />

                          {venueQuery && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow max-h-48 overflow-auto z-50">
                              {(venues || []).filter((x:any) => x.name.toLowerCase().includes(venueQuery.toLowerCase())).map((v:any) => (
                                <div key={v.id} className="w-full px-3 py-2 text-gray-900 hover:bg-gray-100 cursor-pointer text-center" onClick={() => {
                                  const cur = form.getValues('venue_ids') || [];
                                  const vid = String(v.id);
                                  if (!cur.includes(vid)) form.setValue('venue_ids', [...cur, vid]);
                                  setVenueQuery('');
                                }}>{v.name}</div>
                              ))}
                              {(venues || []).filter((x:any) => x.name.toLowerCase().includes(venueQuery.toLowerCase())).length === 0 && (
                                <div className="px-3 py-2 text-sm text-gray-500 text-center">No matches</div>
                              )}
                            </div>
                          )}
                        </div>
                        </div>
                      </div>
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <div>
                      {isEditing ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDelete}
                          disabled={loading}
                          className="text-red-600 border border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button type="submit" variant="default" size="sm" className="btn-primary inline-flex items-center gap-2" disabled={loading}>Save</Button>
                    </div>
                  </div>
                </Form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
