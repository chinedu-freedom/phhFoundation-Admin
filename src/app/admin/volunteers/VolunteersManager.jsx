"use client";

import { useState } from "react";
import { Search, X, FileText } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import Pagination from "@/components/Pagination";

export default function VolunteersManager({ initialVolunteers = [] }) {
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("ALL");
  const [selectedMotivation, setSelectedMotivation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  const totalItems = filteredVolunteers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedVolunteers = filteredVolunteers.slice(
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
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full rounded-md border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors"
          />
        </div>

        {/* Skill / Talent Filter */}
        <CustomSelect
          value={selectedSkill}
          onChange={(val) => {
            setSelectedSkill(val);
            setCurrentPage(1);
          }}
          options={skillOptions}
          placeholder="Filter Skill..."
          className="w-full md:w-56"
        />
      </div>

      {/* Applications Table */}
      <div className="rounded-md border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Skills / Talents</th>
                <th className="px-6 py-4">Applied Date</th>
                <th className="px-6 py-4 text-right">Motivation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginatedVolunteers.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                  <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                    {v.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-900 dark:text-white font-medium">{v.email}</div>
                    <div className="text-xs text-zinc-400">{v.phone}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">
                    {v.location}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {v.skills.split(",").map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xxs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-400">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedMotivation(v)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 transition-colors shadow-xs"
                    >
                      <FileText className="h-3.5 w-3.5 text-blue-500" />
                      Read Letter
                    </button>
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
        <Pagination meta={paginationMeta} onPageChange={setCurrentPage} />
      </div>

      {/* Motivation Letter Modal */}
      {selectedMotivation && (
        <div
          onClick={() => setSelectedMotivation(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 border border-zinc-100 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800 cursor-default"
          >
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
