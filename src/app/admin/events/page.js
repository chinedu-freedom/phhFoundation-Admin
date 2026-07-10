import { prisma } from "@/lib/db";
import EventsManager from "./EventsManager";

export const metadata = {
  title: "Manage Events | HH Admin",
};

export default async function AdminEventsPage() {
  const rawEvents = await prisma.event.findMany({
    orderBy: { date: "asc" },
  });

  // Convert Date objects to JSON-compatible types for the client component
  const formattedEvents = rawEvents.map(e => ({
    ...e,
    date: e.date instanceof Date ? e.date.toISOString() : e.date,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt
  }));

  return (
    <EventsManager initialEvents={formattedEvents} />
  );
}
