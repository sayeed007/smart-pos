"use client";

import { CustomersTab } from "@/components/people/CustomersTab";
import { UsersTab } from "@/components/people/UsersTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";

import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/page-header";

export default function PeoplePage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active tab from URL or default to 'customers'
  const activeTab = searchParams.get("tab") || "customers";

  // Update URL when tab changes
  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`/admin/people?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <PageHeader
        title={t("people", "People")}
        description={t(
          "peopleSubtitle",
          "Manage your organization's users and customers",
        )}
      />

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="customers">
            {t("customers", "Customers")}
          </TabsTrigger>
          <TabsTrigger value="users">{t("users", "Users")}</TabsTrigger>
        </TabsList>
        <TabsContent value="customers" className="mt-6">
          <CustomersTab />
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
