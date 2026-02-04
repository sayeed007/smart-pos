"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { User, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, UserPlus, Shield, Trash2, Edit } from "lucide-react";

export default function UsersPage() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/users")).data,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Users & Roles
          </h1>
          <p className="text-gray-400 font-medium">Manage system access</p>
        </div>
        <Button className="rounded-2xl bg-[#f87171] hover:bg-[#ef4444] shadow-lg shadow-red-100">
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="rounded-[2.5rem] border border-gray-100 shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="py-6 pl-8 font-black uppercase text-xs tracking-widest text-gray-400">
                User
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400">
                Role
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400">
                Status
              </TableHead>
              <TableHead className="pr-8 text-right font-black uppercase text-xs tracking-widest text-gray-400">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="animate-spin text-gray-300" />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-gray-50/50 transition-colors border-gray-100"
                >
                  <TableCell className="py-5 pl-8 font-bold text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-black">
                        {user.id === "u1" ? "AD" : "UI"}
                      </div>
                      <div>
                        {user.name}
                        <div className="text-xs text-gray-400 font-normal">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {user.role === UserRole.ADMIN && (
                        <Shield size={14} className="text-[#f87171]" />
                      )}
                      <span className="font-bold text-gray-700 capitalize">
                        {user.role}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-600"}`}
                    >
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-[#f87171]"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
