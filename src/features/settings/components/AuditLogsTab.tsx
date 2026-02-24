import { useState } from "react";
import { useAuditLogs, type AuditLogEntry } from "@/hooks/api/audit-logs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Activity, Search } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/pagination";

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "-";
  return format(parsed, "MMM d, yyyy HH:mm:ss");
}

export function AuditLogsTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching, isError } = useAuditLogs({
    page,
    limit: pageSize,
    search: search || undefined,
  });
  const logs = data?.data || [];
  const meta = data?.meta;

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <Card className="rounded-xl border border-sidebar-border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-row items-center gap-2">
          <Activity className="w-5 h-5" />
          <div>
            <CardTitle className="typo-bold-18">System Activity Logs</CardTitle>
            <CardDescription>
              View an audit trail of user actions across the system
            </CardDescription>
          </div>
          {isFetching && !isLoading ? (
            <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>

        <div className="mt-4 flex w-full items-center gap-2">
          <div className="relative w-full max-w-90">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
              placeholder="Search action or entity"
              className="pl-8"
            />
          </div>
          <Button type="button" variant="outline" onClick={applySearch}>
            Filter
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>User Email</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-48 text-center text-destructive"
                  >
                    Failed to load audit logs
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-48 text-center text-muted-foreground"
                  >
                    No system logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: AuditLogEntry) => (
                  <TableRow key={log.id} className="hover:bg-muted/20">
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.user?.email || "System"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-secondary/10 font-mono text-xs font-semibold"
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.entityId}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.ipAddress || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DataPagination
          page={meta?.page || 1}
          totalPages={meta?.totalPages || 1}
          totalItems={meta?.total}
          hasPreviousPage={meta?.hasPreviousPage}
          hasNextPage={meta?.hasNextPage}
          onPageChange={setPage}
          pageSize={pageSize}
          pageSizeOptions={[25, 50, 100]}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
        />
      </CardContent>
    </Card>
  );
}
