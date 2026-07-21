import { prisma } from "@/lib/db";
import PartnersClient from "./PartnersClient";

export const metadata = {
  title: "Partners & Inquiries | HH Admin",
};

export default async function AdminPartnersPage() {
  const rawPartners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rawInquiries = await prisma.auditLog.findMany({
    where: { action: "PARTNER_FORM_SUBMIT" },
    orderBy: { createdAt: "desc" },
  });

  const partners = rawPartners.map((p) => ({
    ...p,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  }));

  const inquiries = rawInquiries.map((i) => ({
    ...i,
    createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          Partners & Inquiries
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Manage featured partner organization logos and review corporate partnership applications.
        </p>
      </div>

      <PartnersClient initialPartners={partners} initialInquiries={inquiries} />
    </div>
  );
}
