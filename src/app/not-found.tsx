"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Home, MoveLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import Lottie from "lottie-react";
import ghostAnimation from "../../public/animations/404_not_found.json";

export default function NotFound() {
  const router = useRouter();
  const { t } = useTranslation("common");

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center text-center">
        <div
          className="relative mb-6 flex h-60 w-80 items-center justify-center sm:h-64"
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl opacity-60" />
          <Lottie
            animationData={ghostAnimation}
            loop={true}
            className="h-full w-full scale-110"
          />
        </div>

        {/* Large 404 Text - Decorative */}
        <span
          className="mb-3 tracking-tighter text-primary/5 typo-bold-72 sm:typo-bold-128"
          aria-hidden="true"
        >
          {t("notFound.title", "404")}
        </span>

        {/* Main Content */}
        <div className="space-y-4">
          <h1 className="tracking-tight text-foreground typo-bold-30 sm:typo-bold-36">
            {t("notFound.subtitle", "Page not found")}
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto text-balance typo-regular-16">
            {t(
              "notFound.description",
              "Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.",
            )}
          </p>
        </div>

        <div className="mt-10 flex flex-col w-full gap-3 sm:flex-row sm:justify-center z-10 relative">
          <PrimaryActionButton
            asChild
            size="lg"
            className="gap-2 w-full sm:w-auto"
          >
            <Link href="/">
              <Home className="size-4" />
              {t("notFound.goHome", "Go to Homepage")}
            </Link>
          </PrimaryActionButton>

          <Button
            variant="outline"
            size="lg"
            className="gap-2 w-full sm:w-auto"
            onClick={handleGoBack}
          >
            <MoveLeft className="size-4" />
            {t("notFound.goBack", "Go Back")}
          </Button>
        </div>
      </div>
    </div>
  );
}
