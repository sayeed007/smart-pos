"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, ShieldAlert } from "lucide-react";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async () => {
    setIsLoading(true);
    // Simulate API delay for better UX feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (pin === "1234") {
      onUnlock();
      setError(false);
    } else {
      setError(true);
      setPin("");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-125 border border-border/50 animate-in zoom-in-95 duration-300 slide-in-from-bottom-10">
        {/* Left Side - Branding */}
        <div className="md:w-1/2 bg-[#f87171] relative flex flex-col items-center justify-center p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/30 skew-y-3 transform hover:skew-y-0 transition-transform duration-500">
              <Lock size={40} className="text-white drop-shadow-md" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight drop-shadow-md">
                Session Locked
              </h2>
              <p className="text-red-100 font-medium text-sm max-w-xs mx-auto leading-relaxed">
                Your session has been secured due to inactivity. Please verify
                your identity to continue.
              </p>
            </div>

            <div className="pt-8 flex gap-3 text-[10px] font-bold uppercase tracking-widest text-red-100/60">
              <span>Secure</span>
              <span>•</span>
              <span>Encrypted</span>
              <span>•</span>
              <span>Private</span>
            </div>
          </div>
        </div>

        {/* Right Side - Unlock Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#fcfdfe] relative">
          <div className="space-y-6 w-full max-w-xs mx-auto">
            <div className="text-center md:text-left space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Welcome Back</h3>
              <p className="text-gray-500 text-sm">
                Enter your PIN to resume work
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Security PIN
                </label>
                <div className="relative">
                  <Input
                    type={showPin ? "text" : "password"}
                    className="text-center text-3xl tracking-[0.5em] h-16 font-mono placeholder:tracking-widest bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-[#f87171] rounded-xl transition-all shadow-sm pr-12"
                    placeholder="••••"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      if (val.length <= 4) {
                        setPin(val);
                        setError(false);
                      }
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && pin.length === 4 && handleUnlock()
                    }
                    autoFocus
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 text-destructive text-sm font-medium animate-in slide-in-from-top-1 bg-destructive/10 p-2 rounded-lg">
                  <ShieldAlert size={16} />
                  <span>Invalid PIN. Please try again.</span>
                </div>
              )}

              <PrimaryActionButton
                className="w-full h-12 text-base rounded-xl mt-2"
                onClick={handleUnlock}
                disabled={pin.length < 4 || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Unlock Session"
                )}
              </PrimaryActionButton>
            </div>

            <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest pt-8">
              Current User: Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
