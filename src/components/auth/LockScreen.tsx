"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleUnlock = () => {
    if (pin === "1234") {
      // Mock PIN
      onUnlock();
      setError(false);
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="w-full max-w-sm p-8 space-y-6 bg-card rounded-xl border shadow-2xl text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
          <Lock size={32} />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Session Locked</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Enter PIN to resume (1234)
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="password"
            className="text-center text-2xl tracking-[0.5em] h-14 font-mono placeholder:tracking-normal"
            placeholder="••••"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            autoFocus
          />
          {error && (
            <p className="text-destructive text-sm font-medium animate-pulse">
              Invalid PIN
            </p>
          )}

          <Button className="w-full h-12 text-lg" onClick={handleUnlock}>
            Unlock
          </Button>
        </div>
      </div>
    </div>
  );
}
