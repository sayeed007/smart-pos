"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/axios";
import { MOCK_USERS } from "@/lib/mock-data";
import { User, UserRole } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Edit,
  Loader2,
  Shield,
  Trash2,
  UserPlus,
  User as UserIcon,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/users")).data,
    initialData: MOCK_USERS,
  });

  const handleDelete = (user: User) => {
    toast.error("Delete functionality not implemented in demo.");
  };

  const handleEdit = (user: User) => {
    toast.info(`Edit user: ${user.name}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            User Management
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Manage system users and permissions
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground shadow-lg transition-all">
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted border-0">
            <TableRow className="typo-semibold-14 border-b border-sidebar-border p-2">
              <TableHead className="w-[200px]">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-sidebar-border p-2 odd:bg-card even:bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-chart-1/10 flex items-center justify-center text-chart-1 border border-chart-1/20">
                        {user.role === UserRole.ADMIN ? (
                          <Shield size={16} />
                        ) : (
                          <UserIcon size={16} />
                        )}
                      </div>
                      <span className="font-semibold text-foreground">
                        {user.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`capitalize ${
                        user.role === UserRole.ADMIN
                          ? "bg-red-100 text-red-700 hover:bg-red-100/80"
                          : user.role === UserRole.MANAGER
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100/80"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-100/80"
                      }`}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                      className={
                        user.status === "active"
                          ? "bg-green-100 text-green-700 hover:bg-green-100/80 shadow-none"
                          : ""
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
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

      {/* Role Permissions Section */}
      <Card className="rounded-xl border border-sidebar-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-red-100 rounded-full text-red-600">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Admin</h3>
              <p className="text-sm text-muted-foreground">
                Full access to all features including user management and
                settings
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-orange-100 rounded-full text-orange-600">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Manager</h3>
              <p className="text-sm text-muted-foreground">
                Access to POS, inventory, reports, and customer management
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-gray-100 rounded-full text-gray-600">
              <UserIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Cashier</h3>
              <p className="text-sm text-muted-foreground">
                Access to POS, products, and customer management only
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
