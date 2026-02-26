"use client";

import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { DeleteButton } from "@/components/ui/delete-button";
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
import { getErrorMessage } from "@/lib/errors";
import { UserFormValues } from "@/lib/validations/user";
import { User, UserRole } from "@/types";
import { Loader2, Plus, Shield, User as UserIcon, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { DataPagination } from "@/components/ui/pagination";

import { PageHeader } from "@/components/ui/page-header";
import { useTranslation } from "react-i18next";

export function UsersTab() {
  const { t } = useTranslation(["users", "common"]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: usersData, isLoading } = useUsers({
    search: debouncedSearch,
    page,
    limit: pageSize,
  });
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const users = usersData?.data || [];
  const meta = usersData?.meta;

  const handleCreate = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  // const handleEdit = (user: User) => {
  //   setSelectedUser(user);
  //   setIsDialogOpen(true);
  // };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteMutation.mutateAsync(userToDelete.id);
      setUserToDelete(null);
      setUserToDelete(null);
      toast.success(t("toasts.deleted", "User deleted successfully"));
    } catch (error) {
      console.error(error);
      toast.error(
        getErrorMessage(
          error,
          t("toasts.deleteError", "Failed to delete user"),
        ),
      );
    }
  };

  const handleSubmit = async (values: UserFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            toast.success(t("toasts.updated", "User updated successfully"));
          },
          onError: (error: unknown) => {
            console.error(error);
            toast.error(
              getErrorMessage(
                error,
                t("toasts.updateError", "Failed to update user"),
              ),
            );
          },
        },
      );
    } else {
      delete payload.status; // Backend does not accept status on create
      await createMutation.mutateAsync(payload, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success(t("toasts.created", "User created successfully"));
        },
        onError: (error: unknown) => {
          console.error(error);
          toast.error(
            getErrorMessage(
              error,
              t("toasts.createError", "Failed to create user"),
            ),
          );
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title", "User Management")}
        description={t("subtitle", "Manage system users and permissions")}
      >
        <PrimaryActionButton onClick={handleCreate} icon={Plus}>
          {t("addUser", "Add User")}
        </PrimaryActionButton>
      </PageHeader>

      <UserSearchBar value={search} onChange={setSearch} />

      <div className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden mb-2">
        <Table>
          <TableHeader className="bg-muted/50 border-0">
            <TableRow className="typo-semibold-14 border-b border-sidebar-border p-2">
              <TableHead className="w-62.5">
                {t("table.user", "User")}
              </TableHead>
              <TableHead>{t("table.email", "Email")}</TableHead>
              <TableHead>{t("table.role", "Role")}</TableHead>
              <TableHead>{t("table.status", "Status")}</TableHead>
              <TableHead className="text-right">
                {t("table.actions", "Actions")}
              </TableHead>
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users
                      size={48}
                      className="mb-4 text-muted-foreground/30"
                    />
                    <p className="typo-semibold-14">
                      {t("table.noUsers", "No users found")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
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
                        {t(
                          `roles.${(typeof user.role === "object" ? user.role.name : user.role).toLowerCase()}`,
                          typeof user.role === "object"
                            ? user.role.name
                            : user.role,
                        )}
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
                        {t(`status.${user.status.toLowerCase()}`, user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <DeleteButton
                          onClick={() => handleDelete(user)}
                          label="Delete user"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {meta && (
        <DataPagination
          page={meta.page}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          hasPreviousPage={meta.hasPreviousPage}
          hasNextPage={meta.hasNextPage}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
        />
      )}

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
        title={t("deleteDialog.title", "Delete User?")}
        description={t(
          "deleteDialog.description",
          "Are you sure you want to delete {{name}}? This action cannot be undone.",
          { name: userToDelete?.name },
        )}
        confirmLabel={t("deleteDialog.confirm", "Delete")}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
