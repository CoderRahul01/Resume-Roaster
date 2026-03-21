"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image && (
          <img
            src={session.user.image}
            alt=""
            className="w-7 h-7 rounded-full border border-white/10"
          />
        )}
        <span className="text-[11px] text-zinc-400 hidden sm:inline">
          {session.user.name ?? session.user.email}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-zinc-500 hover:text-white h-7 px-2"
        >
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signIn("google")}
      className="text-zinc-400 hover:text-white h-7 px-3 text-[11px] gap-1.5"
    >
      <LogIn className="w-3.5 h-3.5" />
      Sign in
    </Button>
  );
}
