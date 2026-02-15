"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { UserSearchBar } from "@/components/users/UserSearchBar";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/hooks/api/users";
import { UserFormValues } from "@/lib/validations/user";
import { User, UserRole } from "@/types";
import {
  Edit,
  Loader2,
  Plus,
  Shield,
  Trash2,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

export function UsersTab() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: users, isLoading } = useUsers({ search: debouncedSearch });
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const handleCreate = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteMutation.mutateAsync(userToDelete.id);
      setUserToDelete(null);
      toast.success("User deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    }
  };

  const handleSubmit = async (values: UserFormValues) => {
    const payload: any = {
      ...values,
      roleIds: [values.roleId],
    };
    delete payload.roleId;

    if (selectedUser) {
      // Backend does not allow updating email
      delete payload.email;
      // Backend expects uppercase status
      if (payload.status) {
        payload.status = payload.status.toUpperCase();
      }

      await updateMutation.mutateAsync(
        { id: selectedUser.id, data: payload },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            toast.success("User updated successfully");
          },
          onError: (error: any) => {
            console.error(error);
            toast.error(
              error?.response?.data?.message || "Failed to update user",
            );
          },
        },
      );
    } else {
      delete payload.status; // Backend does not accept status on create
      await createMutation.mutateAsync(payload, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success("User created successfully");
        },
        onError: (error: any) => {
          console.error(error);
          toast.error(
            error?.response?.data?.message || "Failed to create user",
          );
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="typo-bold-18 text-foreground tracking-tight">
            User Management
          </h2>
          <p className="typo-regular-14 text-muted-foreground mt-1">
            Manage system users and permissions
          </p>
        </div>
        <PrimaryActionButton onClick={handleCreate} icon={Plus}>
          Add User
        </PrimaryActionButton>
      </div>

      <UserSearchBar value={search} onChange={setSearch} />

      <div className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted border-0">
            <TableRow className="typo-semibold-14 border-b border-sidebar-border p-2">
              <TableHead className="w-62.5">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users
                      size={48}
                      className="mb-4 text-muted-foreground/30"
                    />
                    <p className="typo-semibold-14">No users found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => {
                const roleName =
                  typeof user.role === "object" ? user.role.name : user.role;
                return (
                  <TableRow
                    key={user.id}
                    className="border-sidebar-border p-2 odd:bg-card even:bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-chart-1/10 flex items-center justify-center text-chart-1 border border-chart-1/20">
                          {roleName === UserRole.ADMIN ? (
                            <Shield size={16} />
                          ) : (
                            <UserIcon size={16} />
                          )}
                        </div>
                        <span className="typo-semibold-14 text-foreground">
                          {user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground typo-regular-14">
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
                        {typeof user.role === "object"
                          ? (user.role as { name: string }).name
                          : user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status.toLowerCase() === "active"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          user.status.toLowerCase() === "active"
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
                          className="h-8 w-8 text-muted-foreground hover:text-chart-1 hover:bg-chart-1/10 cursor-pointer transition-colors"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmationDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Delete User?"
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
