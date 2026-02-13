"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/api/auth";
import { cn } from "@/lib/utils";
import { mapBackendRoleToUiRole, useAuth } from "@/providers/auth-provider";
import { User, UserRole } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Shield, Smartphone, Store } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.nativeEnum(UserRole),
});

export default function LoginPage() {
  const { login } = useAuth();
  const loginMutation = useLogin();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "admin@aura-demo.com",
      password: "SecureP@ss123",
      role: UserRole.CASHIER,
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
          const resolvedRole = mapBackendRoleToUiRole(
            data.user.roles,
            values.role,
          );

          const user: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: resolvedRole,
            status: "active",
          };

          login(user, {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            tenantId: data.user.tenantId,
          });

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
          <h1 className="text-6xl font-black mb-4 tracking-tight drop-shadow-lg">
            Aura POS
          </h1>
          <p className="text-xl font-medium text-red-100 max-w-md mx-auto leading-relaxed">
            The next generation retail platform for seamless commerce and
            superior customer experiences.
          </p>

          <div className="mt-12 flex justify-center gap-4">
            <div className="px-6 py-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20 text-sm font-bold">
              Fast
            </div>
            <div className="px-6 py-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20 text-sm font-bold">
              Secure
            </div>
            <div className="px-6 py-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20 text-sm font-bold">
              Reliable
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#fcfdfe] h-screen overflow-hidden">
        <div className="w-full max-w-sm space-y-6 animate-in slide-in-from-right duration-500">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-400 font-medium mt-1 text-sm">
              Please select your role and sign in
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Role Selection - Custom Cards */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Select Role
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            value: UserRole.CASHIER,
                            label: "Cashier",
                            icon: Store,
                          },
                          {
                            value: UserRole.ADMIN,
                            label: "Admin",
                            icon: Shield,
                          },
                        ].map((role) => {
                          const Icon = role.icon;
                          const isSelected = field.value === role.value;
                          return (
                            <div
                              key={role.value}
                              onClick={() => field.onChange(role.value)}
                              className={cn(
                                "cursor-pointer rounded-xl p-3 border-2 transition-all duration-200 flex flex-col items-center gap-1.5",
                                isSelected
                                  ? "border-[#f87171] bg-red-50 text-[#f87171]"
                                  : "border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50",
                              )}
                            >
                              <Icon
                                size={20}
                                className={cn(
                                  isSelected
                                    ? "text-[#f87171]"
                                    : "text-gray-300",
                                )}
                              />
                              <span className="font-bold text-xs tracking-wide">
                                {role.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
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
                      <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="h-12 rounded-xl bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-[#f87171] transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 text-base rounded-xl shadow-lg shadow-red-100 bg-[#f87171] hover:bg-destructive transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            Protected by Aura Security
          </p>
        </div>
      </div>
    </div>
  );
}
