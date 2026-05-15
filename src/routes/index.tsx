import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Hero } from "@/components/sections/Hero";
import { AboutMovement } from "@/components/sections/AboutMovement";
import { EventsPreview } from "@/components/sections/EventsPreview";
import { MembershipPreview } from "@/components/sections/MembershipPreview";
import { CommunityFeed } from "@/components/sections/CommunityFeed";
import { Testimonials } from "@/components/sections/Testimonials";
import { EmailSignup } from "@/components/sections/EmailSignup";
import { branding } from "@/config/branding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: branding.seo.defaultTitle },
      { name: "description", content: branding.seo.defaultDescription },
      { property: "og:title", content: branding.fullName },
      { property: "og:description", content: branding.tagline },
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
