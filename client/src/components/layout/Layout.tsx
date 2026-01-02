import { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header"; 
import { SkipLink } from "@/components/common/SkipLink";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <SkipLink />
      <Header />
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}