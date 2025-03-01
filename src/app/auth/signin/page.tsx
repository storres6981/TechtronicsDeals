import { getProviders } from "next-auth/react";
import { SignInButton } from "@/app/components/SignInButton";

export default async function SignIn() {
  const providers = await getProviders();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl font-bold">Sign In</h1>
        <div className="flex flex-col space-y-4">
          {providers &&
            Object.values(providers).map((provider) => (
              <SignInButton
                key={provider.id}
                provider={provider}
              />
            ))}
        </div>
      </div>
    </div>
  );
}