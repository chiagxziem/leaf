import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cancelToastEl } from "@/components/ui/toaster";
import { authClient } from "@/lib/auth-client";
import env from "@/lib/env";

export const Route = createFileRoute("/auth/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const [buttonState, setButtonState] = useState<"idle" | "loading">("idle");

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: `${env.VITE_BASE_URL}`,
        },
        {
          onRequest() {
            setButtonState("loading");
          },
          onSuccess: () => {
            setButtonState("idle");
          },
          onError(ctx) {
            setButtonState("idle");
            toast.error(ctx.error.message, cancelToastEl);
          },
        },
      );
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }
    } finally {
      setButtonState("idle");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="size-10">
        <Image
          alt="App Logo"
          background="auto"
          layout="fullWidth"
          priority
          src={"/logos/app-logo.png"}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold font-roboto text-3xl">Sign In</h1>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            disabled={buttonState === "loading"}
            onClick={handleGoogleSignIn}
            type="button"
          >
            {buttonState === "loading"
              ? "Signing in..."
              : "Sign in with Google"}
          </Button>
        </div>
      </div>
    </div>
  );
}
