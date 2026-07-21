"use client";

import { useState } from "react";
import { Plus, Trash2, UserCog, Shield, User, Search } from "lucide-react";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { createUserAction, updateUserRoleAction, deleteUserAction } from "@/app/actions/user";
import { toast } from "sonner";

export default function UsersClient({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsCreating(true);
    const res = await createUserAction(null, formData);
    setIsCreating(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("User account created successfully");
      setIsModalOpen(false);
      window.location.reload();
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const res = await updateUserRoleAction(user.id, newRole);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Role updated to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const res = await deleteUserAction(deletingId);
    setIsDeleting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("User account deleted");
      setUsers((prev) => prev.filter((u) => u.id !== deletingId));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm md:bg-transparent md:p-0 md:border-0 md:shadow-none">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add New User / Admin
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Joined Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <UserCog className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No user accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-xs">
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleRole(user)}
                        title="Click to toggle role (ADMIN / USER)"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xxs font-extrabold border cursor-pointer transition-colors ${
                          user.role === "ADMIN"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
                            : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 hover:bg-slate-500/20"
                        }`}
                      >
                        {user.role === "ADMIN" ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        {user.role}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeletingId(user.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200"
          >
            <h3 className="text-lg font-bold text-foreground">Create User Account</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@hephzibahhumanitarianf.org"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  name="password"
                  minLength={6}
                  required
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Account Role
                </label>
                <select
                  name="role"
                  defaultValue="USER"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                >
                  <option value="USER">User (Standard User)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-foreground font-semibold text-xs hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isCreating ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        description="Are you sure you want to delete this account?"
        isLoading={isDeleting}
      />
    </div>
  );
}
