"use client";

import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  clearStoredPlatformAuth,
  getStoredPlatformAuth,
  setStoredPlatformAuth,
} from "@/lib/platform-auth-storage";
import {
  createPlatformTenantApi,
  listPlatformTenantsApi,
  platformLoginApi,
  type PlatformCreateTenantRequestDto,
  type PlatformTenantListItem,
} from "@/lib/services/backend/platform.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

const createTenantSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  slug: z.string().optional(),
  currency: z
    .string()
    .min(3, "Currency is required")
    .max(3, "Currency must be 3 letters"),
  timezone: z.string().min(1, "Timezone is required"),
  adminName: z.string().min(2, "Admin name is required"),
  adminEmail: z.string().email("Valid admin email is required"),
  adminPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Password must include upper, lower, and number",
    }),
  adminPhone: z.string().optional(),
  locationName: z.string().optional(),
  locationAddress: z.string().optional(),
  locationPhone: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;
type CreateTenantValues = z.infer<typeof createTenantSchema>;

const toOptional = (value: string | undefined) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message;
    if (typeof message === "string" && message.trim().length) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim().length) {
    return error.message;
  }
  return fallback;
};

export default function PlatformConsolePage() {
  const [platformToken, setPlatformToken] = useState<string | null>(null);
  const [accessTokenExpiry, setAccessTokenExpiry] = useState<string | null>(null);
  const [platformUserEmail, setPlatformUserEmail] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [tenants, setTenants] = useState<PlatformTenantListItem[]>([]);

  const devPlatformEmail = process.env.NEXT_PUBLIC_PLATFORM_SUPER_ADMIN_EMAIL ?? "";
  const devPlatformPassword =
    process.env.NEXT_PUBLIC_PLATFORM_SUPER_ADMIN_PASSWORD ?? "";

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: devPlatformEmail,
      password: devPlatformPassword,
    },
  });

  const createTenantForm = useForm<CreateTenantValues>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      businessName: "",
      slug: "",
      currency: "USD",
      timezone: "UTC",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      adminPhone: "",
      locationName: "Main Store",
      locationAddress: "",
      locationPhone: "",
    },
  });

  useEffect(() => {
    const stored = getStoredPlatformAuth();
    if (!stored) return;

    setPlatformToken(stored.accessToken);
    setAccessTokenExpiry(stored.accessTokenExpiresAt);
  }, []);

  const loadTenants = useCallback(async (token: string) => {
    setIsLoadingTenants(true);
    try {
      const result = await listPlatformTenantsApi(token);
      setTenants(result.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load platform tenants"));
    } finally {
      setIsLoadingTenants(false);
    }
  }, []);

  useEffect(() => {
    if (!platformToken) {
      setTenants([]);
      return;
    }
    void loadTenants(platformToken);
  }, [platformToken, loadTenants]);

  const onPlatformLogin = async (values: LoginValues) => {
    setIsLoggingIn(true);
    try {
      const response = await platformLoginApi({
        email: values.email,
        password: values.password,
      });

      setStoredPlatformAuth({
        accessToken: response.accessToken,
        accessTokenExpiresAt: response.accessTokenExpiresAt,
      });
      setPlatformToken(response.accessToken);
      setAccessTokenExpiry(response.accessTokenExpiresAt);
      setPlatformUserEmail(response.user.email);
      toast.success("Platform login successful");
    } catch (error) {
      toast.error(getErrorMessage(error, "Platform login failed"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const onCreateTenant = async (values: CreateTenantValues) => {
    if (!platformToken) {
      toast.error("Please login as platform super admin first");
      return;
    }

    const payload: PlatformCreateTenantRequestDto = {
      businessName: values.businessName.trim(),
      slug: toOptional(values.slug),
      currency: values.currency.trim().toUpperCase(),
      timezone: values.timezone.trim(),
      adminName: values.adminName.trim(),
      adminEmail: values.adminEmail.trim(),
      adminPassword: values.adminPassword,
      adminPhone: toOptional(values.adminPhone),
      locationName: toOptional(values.locationName),
      locationAddress: toOptional(values.locationAddress),
      locationPhone: toOptional(values.locationPhone),
    };

    setIsCreatingTenant(true);
    try {
      const response = await createPlatformTenantApi(platformToken, payload);
      toast.success(
        `Tenant "${response.tenant.name}" created (${response.tenant.slug})`,
      );

      createTenantForm.reset({
        businessName: "",
        slug: "",
        currency: values.currency.trim().toUpperCase(),
        timezone: values.timezone.trim(),
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        adminPhone: "",
        locationName: "Main Store",
        locationAddress: "",
        locationPhone: "",
      });

      await loadTenants(platformToken);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create tenant"));
    } finally {
      setIsCreatingTenant(false);
    }
  };

  const handleLogout = () => {
    clearStoredPlatformAuth();
    setPlatformToken(null);
    setPlatformUserEmail("");
    setAccessTokenExpiry(null);
    setTenants([]);
    toast.success("Platform session cleared");
  };

  const isAuthenticated = useMemo(() => !!platformToken, [platformToken]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="typo-bold-24 text-slate-900">Platform Console</h1>
            <p className="typo-regular-12 text-slate-500">
              Controlled onboarding for tenant provisioning
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/login">Back to POS Login</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="typo-bold-16">Super Admin Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onPlatformLogin)}
                  className="space-y-3"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="root@tafuri.local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <PrimaryActionButton
                    type="submit"
                    className="w-full"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? "Signing In..." : "Sign In as Super Admin"}
                  </PrimaryActionButton>
                </form>
              </Form>

              {isAuthenticated && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
                  <p className="typo-semibold-14">Authenticated</p>
                  {platformUserEmail ? (
                    <p className="typo-regular-12">Email: {platformUserEmail}</p>
                  ) : null}
                  {accessTokenExpiry ? (
                    <p className="typo-regular-12">
                      Expires at: {new Date(accessTokenExpiry).toLocaleString()}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    onClick={handleLogout}
                    variant="outline"
                    className="mt-3"
                  >
                    Clear Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="typo-bold-16">
                Create Tenant + Admin + Base Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...createTenantForm}>
                <form
                  onSubmit={createTenantForm.handleSubmit(onCreateTenant)}
                  className="space-y-3"
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <FormField
                      control={createTenantForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Retail" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createTenantForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="acme-retail" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createTenantForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <Input placeholder="USD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createTenantForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Timezone</FormLabel>
                          <FormControl>
                            <Input placeholder="UTC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createTenantForm.control}
                      name="adminName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Tenant Admin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createTenantForm.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@acme.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createTenantForm.control}
                      name="adminPassword"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Admin Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="SecureP@ss123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createTenantForm.control}
                      name="adminPhone"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Admin Phone (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="+1-555-100-2000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createTenantForm.control}
                      name="locationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Location Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Main Store" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createTenantForm.control}
                      name="locationPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Location Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1-555-000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createTenantForm.control}
                      name="locationAddress"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Base Location Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <PrimaryActionButton
                    type="submit"
                    className="w-full"
                    disabled={!isAuthenticated || isCreatingTenant}
                  >
                    {isCreatingTenant ? "Creating Tenant..." : "Create Tenant"}
                  </PrimaryActionButton>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="typo-bold-16">Tenant Registry</CardTitle>
          </CardHeader>
          <CardContent>
            {!isAuthenticated ? (
              <p className="typo-regular-14 text-slate-500">
                Login as platform super admin to view tenants.
              </p>
            ) : isLoadingTenants ? (
              <p className="typo-regular-14 text-slate-500">Loading tenants...</p>
            ) : tenants.length === 0 ? (
              <p className="typo-regular-14 text-slate-500">
                No tenants found for this environment.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="rounded-md border border-slate-200 bg-white p-3"
                  >
                    <p className="typo-semibold-14 text-slate-900">{tenant.name}</p>
                    <p className="typo-regular-12 text-slate-500">slug: {tenant.slug}</p>
                    <p className="typo-regular-12 text-slate-500">
                      email: {tenant.contactEmail ?? "-"}
                    </p>
                    <p className="typo-regular-12 text-slate-500">
                      users: {tenant._count.users} | locations: {tenant._count.locations}
                    </p>
                    <p className="typo-regular-12 text-slate-500">
                      created: {new Date(tenant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
