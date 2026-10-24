
"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleOAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <p className="text-sm text-stone-500">
        Login Google belum dikonfigurasi.
      </p>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
