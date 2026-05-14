import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Hero } from "@/components/sections/Hero";
import { AboutMovement } from "@/components/sections/AboutMovement";
import { EventsPreview } from "@/components/sections/EventsPreview";
import { MembershipPreview } from "@/components/sections/MembershipPreview";
import { CommunityFeed } from "@/components/sections/CommunityFeed";
import { Testimonials } from "@/components/sections/Testimonials";
import { EmailSignup } from "@/components/sections/EmailSignup";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "B.MARC Pilates, A Wellness Culture for Modern Women" },
      {
        name: "description",
        content:
          "B.MARC Pilates is a luxury wellness community for modern women. Join in-person Pilates events, online classes and a movement built on intention.",
      },
      { property: "og:title", content: "B.MARC Pilates, A Wellness Culture" },
      { property: "og:description", content: "Movement, connection, and intentional living for modern women." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <AboutMovement />
      <EventsPreview />
      <MembershipPreview />
      <CommunityFeed />
      <Testimonials />
      <EmailSignup />
    </SiteLayout>
  );
}
