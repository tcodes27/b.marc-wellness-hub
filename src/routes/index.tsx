import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Hero } from "@/components/sections/Hero";
import { AboutMovement } from "@/components/sections/AboutMovement";
import { EventsPreview } from "@/components/sections/EventsPreview";
import { MembershipPreview } from "@/components/sections/MembershipPreview";
import { YouTubeShowcase } from "@/components/sections/YouTubeShowcase";
import { CommunityFeed } from "@/components/sections/CommunityFeed";
import { Testimonials } from "@/components/sections/Testimonials";
import { EmailSignup } from "@/components/sections/EmailSignup";
import { branding } from "@/config/branding";
import { Gallery } from "@/components/sections/Gallery";
import { StudioEditorial, MovementEditorial, WellnessEditorial } from "@/components/sections/WellnessEditorial";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: branding.seo.defaultTitle },
      { name: "description", content: branding.seo.defaultDescription },
      { property: "og:title", content: branding.fullName },
      { property: "og:description", content: branding.tagline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <AboutMovement />
      <StudioEditorial />
      <MovementEditorial />
      <EventsPreview />
      <Gallery />
      <MembershipPreview />
      <YouTubeShowcase />
      <WellnessEditorial />
      <CommunityFeed />
      <Testimonials />
      <EmailSignup />
    </SiteLayout>
  );
}
