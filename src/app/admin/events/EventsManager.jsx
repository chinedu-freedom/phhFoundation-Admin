"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { upsertEventAction, deleteEventAction } from "@/app/actions/event";
import { Plus, Pencil, Trash, X, Loader2, Calendar, MapPin, CheckSquare, Image as ImageIcon, Users, Search } from "lucide-react";
import Image from "next/image";
import CustomSelect from "@/components/CustomSelect";
import ImagePicker from "@/components/ImagePicker";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import Pagination from "@/components/Pagination";

import UsersIcon from "lucide-react/dist/esm/icons/users";
import Eye from "lucide-react/dist/esm/icons/eye";
import Mail from "lucide-react/dist/esm/icons/mail";

export default function EventsManager({ initialEvents = [], initialRsvps = [] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [events, setEvents] = useState(initialEvents);
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null); // Null for create, Event object for edit
  const [selectedGuestEvent, setSelectedGuestEvent] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Sync props to state
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [image, setImage] = useState("");
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [status, setStatus] = useState("UPCOMING");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginationMeta = {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

  const openCreateModal = () => {
    setEditEvent(null);
    setTitle("");
    setDescription("");
    setDate("");
    setVenue("");
    setImage("");
    setRegistrationRequired(false);
    setStatus("UPCOMING");
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    
    // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
    const d = new Date(event.date);
    const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISODate = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    
    setDate(localISODate);
    setVenue(event.venue);
    setImage(event.image || "");
    setRegistrationRequired(event.registrationRequired);
    setStatus(event.status);
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    if (editEvent) {
      formData.append("id", editEvent.id);
    }
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("venue", venue);
    formData.append("image", image);
    formData.append("registrationRequired", registrationRequired ? "true" : "false");
    formData.append("status", status);

    try {
      const res = await upsertEventAction(null, formData);
      if (res.error) {
        setError(res.error);
        showToast(res.error, "error");
      } else {
        showToast(editEvent ? "Event updated successfully." : "Event scheduled successfully.", "success");
        setShowModal(false);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      showToast("An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await deleteEventAction(eventToDelete);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        setEvents(events.filter((e) => e.id !== eventToDelete));
        showToast("Event deleted successfully.", "success");
        router.refresh();
      }
    } catch (err) {
      showToast("Failed to delete event.", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };



  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Events
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Schedule medical checkups, educational distribution runs, and community workshops.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Schedule Event
        </button>
      </div>

      {/* Search and Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search events by title or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors"
          />
        </div>

        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "ALL", label: "All Statuses" },
            { value: "UPCOMING", label: "Upcoming" },
            { value: "PAST", label: "Past" },
            { value: "CANCELLED", label: "Cancelled" }
          ]}
        />
      </div>

      {/* Events Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedEvents.map((e) => {
            const formattedDate = new Date(e.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={e.id}
                className="flex flex-col rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Event Image */}
                <div className="relative aspect-16/10 bg-zinc-100 dark:bg-zinc-950">
                  {e.image ? (
                    <Image src={e.image} alt={e.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                      <Calendar className="h-12 w-12 stroke-[1.5]" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 rounded-full bg-zinc-950/70 backdrop-blur px-2.5 py-0.5 text-xxs font-bold text-white">
                    {e.status}
                  </div>
                </div>

                {/* Event Info */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white line-clamp-1">
                      {e.title}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">
                      {e.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                    {/* Date, Venue, Registration details */}
                    <div className="flex flex-col gap-2 text-xxs font-semibold text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="truncate">{e.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckSquare className="h-3.5 w-3.5 text-zinc-400" />
                        <span>
                          {e.registrationRequired ? "Registration Required" : "Open Event"}
                          {e.attendeesCount > 0 && ` (${e.attendeesCount} joined)`}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setSelectedGuestEvent(e)}
                        className="px-2.5 py-1.5 rounded-lg border border-blue-500/20 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50 text-xs font-semibold hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <UsersIcon className="h-3.5 w-3.5" /> Guests ({e.attendeesCount})
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(e)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-950 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEventToDelete(e.id);
                            setDeleteModalOpen(true);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <p className="col-span-full py-16 text-center text-sm text-zinc-400">
              No events found. Click "Schedule Event" to plan an activity.
            </p>
          )}
        </div>
        <Pagination meta={paginationMeta} onPageChange={setCurrentPage} />
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-md bg-white p-6 border border-zinc-100 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {editEvent ? "Edit Scheduled Event" : "Schedule New Event"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 hover:bg-zinc-50 dark:hover:bg-zinc-950 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Medical Checkup & Drug Distribution"
                  className="mt-2 block w-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the activities, beneficiaries, required logistics..."
                  className="mt-2 block w-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Venue
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="E.g., Community Hall, Obio Akpor"
                  className="mt-2 block w-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-2 block w-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Status
                  </label>
                  <CustomSelect
                    value={status}
                    onChange={setStatus}
                    options={[
                      { value: "UPCOMING", label: "UPCOMING" },
                      { value: "PAST", label: "PAST" },
                      { value: "CANCELLED", label: "CANCELLED" }
                    ]}
                    className="mt-2 w-full"
                  />
                </div>
              </div>

              <ImagePicker
                value={image}
                onChange={setImage}
                label="Event Image"
              />

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-450 dark:hover:bg-zinc-950 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest List Modal */}
      {selectedGuestEvent && (
        <div
          onClick={() => setSelectedGuestEvent(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full max-w-lg rounded-2xl border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Guest List</h3>
                <p className="text-xs text-muted-foreground">{selectedGuestEvent.title}</p>
              </div>
              <button
                onClick={() => setSelectedGuestEvent(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {rsvps.filter((r) => r.details?.includes(selectedGuestEvent.title)).length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No registered guest logs found for this event.
                </div>
              ) : (
                rsvps
                  .filter((r) => r.details?.includes(selectedGuestEvent.title))
                  .map((guest) => (
                    <div key={guest.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-foreground">{guest.details}</div>
                        <a href={`mailto:${guest.userEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {guest.userEmail}
                        </a>
                      </div>
                      <span className="text-xxs text-muted-foreground">
                        {new Date(guest.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                onClick={() => setSelectedGuestEvent(null)}
                className="px-4 py-2 rounded-xl border border-border text-foreground font-semibold text-xs hover:bg-muted transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEventToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
}
