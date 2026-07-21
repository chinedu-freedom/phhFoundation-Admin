import { prisma } from "@/lib/db";
import EventsManager from "./EventsManager";

export const metadata = {
  title: "Manage Events | HH Admin",
};

export default async function AdminEventsPage() {
  const rawEvents = await prisma.event.findMany({
    orderBy: { date: "asc" },
  });

  const rawRsvps = await prisma.auditLog.findMany({
    where: { action: "EVENT_RSVP" },
    orderBy: { createdAt: "desc" },
  });

  const formattedEvents = rawEvents.map((e) => ({
    ...e,
    date: e.date instanceof Date ? e.date.toISOString() : e.date,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
  }));

  const rsvps = rawRsvps.map((r) => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  }));

  return <EventsManager initialEvents={formattedEvents} initialRsvps={rsvps} />;
}
