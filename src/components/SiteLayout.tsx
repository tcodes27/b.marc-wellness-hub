import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BookingProvider } from "./booking/BookingProvider";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </BookingProvider>
  );
}
