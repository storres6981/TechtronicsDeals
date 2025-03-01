'use client';

import { signIn } from "next-auth/react";
import { ClientSafeProvider } from "next-auth/react";

interface SignInButtonProps {
  provider: ClientSafeProvider;
}

export function SignInButton({ provider }: SignInButtonProps) {
  return (
    <button
      onClick={() => signIn(provider.id, { callbackUrl: '/' })}
      className="flex items-center justify-center gap-3 px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-full"
    >
      <img
        src={`/${provider.id.toLowerCase()}.svg`}
        alt={`${provider.name} logo`}
        className="w-5 h-5"
      />
      Sign in with {provider.name}
    </button>
  );
}