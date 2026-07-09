import { useEffect, useState } from "react";
import { AppRoot } from "./AppRoot";

/**
 * Mounts the React Router DOM app client-side only.
 * BrowserRouter requires `window`, and the entire app is auth-gated,
 * so SSR just returns a lightweight spinner.
 */
export function ClientApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  return <AppRoot />;
}