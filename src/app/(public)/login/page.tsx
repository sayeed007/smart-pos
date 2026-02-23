"use client";

import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/api/auth";
import { mapBackendRoleToUiRole, useAuth } from "@/providers/auth-provider";
import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const loginMutation = useLogin();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isDev = process.env.NODE_ENV === "development";
  const devAdminEmail = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL ?? "";
  const devAdminPassword = process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD ?? "";
  const devCashierEmail = process.env.NEXT_PUBLIC_DEV_CASHIER_EMAIL ?? "";
  const devCashierPassword = process.env.NEXT_PUBLIC_DEV_CASHIER_PASSWORD ?? "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: isDev ? devAdminEmail || "admin@aura-demo.com" : "",
      password: isDev ? devAdminPassword || "SecureP@ss123" : "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    loginMutation.mutate(
      {
        email: values.email,
        password: values.password,
        deviceInfo: "aura-web",
      },
      {
        onSuccess: (data) => {
          const resolvedRole = mapBackendRoleToUiRole(data.user.roles);

          const user: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: resolvedRole,
            status: "active",
          };

          login(user, data.user.tenantId);

          toast.success("Logged in successfully");
        },
        onError: (error) => {
          console.error(error);
          toast.error("Invalid credentials");
          setIsLoading(false);
        },
      },
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#f87171] relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 text-center text-white p-12">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl skew-y-3 border border-white/30">
            <Smartphone size={48} className="text-white drop-shadow-md" />
          </div>
          <h1 className="mb-4 tracking-tight drop-shadow-lg typo-bold-60">
            Aura POS
          </h1>
          <p className="text-red-100 max-w-md mx-auto leading-relaxed typo-medium-20">
            The next generation retail platform for seamless commerce and
            superior customer experiences.
          </p>

          <div className="mt-12 flex justify-center gap-4">
            <div className="px-6 py-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20 typo-bold-14">
              Fast
            </div>
            <div className="px-6 py-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20 typo-bold-14">
              Secure
            </div>
            <div className="px-6 py-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20 typo-bold-14">
              Reliable
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#fcfdfe] h-screen overflow-hidden">
        <div className="w-full max-w-sm space-y-6 animate-in slide-in-from-right duration-500">
          <div className="text-center lg:text-left">
            <h2 className="text-gray-900 tracking-tight typo-regular-24 typo-bold-14">
              Welcome Back
            </h2>
            <p className="text-gray-400 mt-1 typo-medium-14">
              Please select your role and sign in
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] text-gray-400 uppercase tracking-widest ml-1 typo-bold-14">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          className="h-12 rounded-xl bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-[#f87171] transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] text-gray-400 uppercase tracking-widest ml-1 typo-bold-14">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 rounded-xl bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-[#f87171] transition-all pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                          >
                            {showPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <PrimaryActionButton
                type="submit"
                disabled={isLoading}
                className="w-full py-6 rounded-xl typo-regular-16"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </PrimaryActionButton>
            </form>
          </Form>

          <p className="text-center text-[10px] text-gray-300 uppercase tracking-widest typo-bold-14">
            Protected by Aura Security
          </p>
          {isDev && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] text-amber-900">
              <p className="uppercase tracking-widest text-[10px] text-amber-700 typo-bold-14">
                Dev Credentials
              </p>
              <div className="mt-2 space-y-1">
                <p>
                  <span className="typo-semibold-14">Admin:</span>{" "}
                  {devAdminEmail || "admin@aura-demo.com"} /{" "}
                  {devAdminPassword || "SecureP@ss123"}
                </p>
                <p>
                  <span className="typo-semibold-14">Cashier:</span>{" "}
                  {devCashierEmail || "cashier@aura-demo.com"} /{" "}
                  {devCashierPassword || "Cashier@123!"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
