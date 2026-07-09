import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BrandLogo } from "@/app/components/BrandLogo";

export function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-accent/30 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between p-6">
        <Link to="/"><BrandLogo /></Link>
        <div className="text-xs text-muted-foreground">Admiralty University of Nigeria</div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center justify-center px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}