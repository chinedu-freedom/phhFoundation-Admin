"use client";

import { useState } from "react";
import { Search, X, FileText } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

export default function VolunteersManager({ initialVolunteers = [] }) {
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("ALL");
  const [selectedMotivation, setSelectedMotivation] = useState(null);

  // Extract unique skills for dropdown options
  const allSkillsSet = new Set();
  initialVolunteers.forEach((v) => {
    if (v.skills) {
      v.skills.split(",").forEach((s) => {
        const trimmed = s.trim();
        if (trimmed) allSkillsSet.add(trimmed);
      });
    }
  });

  const skillOptions = [
    { value: "ALL", label: "All Skills & Talents" },
    ...Array.from(allSkillsSet).map((s) => ({ value: s, label: s })),
  ];

  // Filter application list by search and skills
  const filteredVolunteers = volunteers.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase()) ||
      v.skills.toLowerCase().includes(search.toLowerCase());

    const matchesSkill =
      selectedSkill === "ALL" ||
      v.skills.toLowerCase().includes(selectedSkill.toLowerCase());

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="space-y-6">
      {/* Search & Skill Filter */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, skills, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors"
          />
        </div>

        {/* Skill / Talent Filter */}
        <CustomSelect
          value={selectedSkill}
          onChange={setSelectedSkill}
          options={skillOptions}
          placeholder="Filter Skill..."
          className="w-full md:w-56"
        />
      </div>

      {/* Applications Grid/Table */}
      <div className="rounded-md border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Email & Date</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Skills & Talents</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4">Letter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredVolunteers.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900 dark:text-white">
                      {v.name}
                    </div>
                    <div className="text-xxs text-zinc-400">
                      {v.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-xs text-zinc-900 dark:text-white">
                      {v.email}
                    </div>
                    <div className="text-xxs text-zinc-400 mt-0.5">
                      Applied: {v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold">{v.location}</td>
                  <td className="px-6 py-4 text-xs max-w-[200px] truncate" title={v.skills}>
                    {v.skills}
                  </td>
                  <td className="px-6 py-4 text-xs">{v.availability}</td>
                  <td className="px-6 py-4">
                    {v.motivation ? (
                      <button
                        onClick={() => setSelectedMotivation(v)}
                        className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <FileText className="h-4 w-4" /> View
                      </button>
                    ) : (
                      <span className="text-zinc-400 text-xxs font-medium">None</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredVolunteers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    No matching applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Motivation Letter Modal */}
      {selectedMotivation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-zinc-100 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Motivation Letter
              </h3>
              <button
                onClick={() => setSelectedMotivation(null)}
                className="rounded-lg cursor-pointer p-1 hover:bg-zinc-50 dark:hover:bg-zinc-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold text-zinc-400">Applicant:</span>
              <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                {selectedMotivation.name}
              </p>
              
              <div className="mt-4 rounded-2xl bg-zinc-50 p-4 border border-zinc-100 text-sm leading-6 text-zinc-600 dark:bg-zinc-950/50 dark:border-zinc-850 dark:text-zinc-400 max-h-60 overflow-y-auto">
                {selectedMotivation.motivation}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedMotivation(null)}
                className="rounded-xl cursor-pointer bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
