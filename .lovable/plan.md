# Community & Membership Experience section

Add one new section, "Community & Membership Experience", to the B.MARĆ site. It shows clearly what anyone can do for free and what people get when they register for the portal. FOCUS is left out, as you asked.

## Where it goes
- **Homepage:** placed right after the membership preview.
- **Membership page:** the same section, placed under the access levels.

## Layout
Two columns side by side on desktop, stacked on mobile, each with small icons:

**Public Community Access (free, no sign-up needed)**
- Upcoming Activities: instructor activities, live classes, wellness events
- Instructor Schedule: when instructors go live, plus dates, times and locations
- Community Discovery: classes, community experiences and in-person events

**Registered Portal Access (free portal registration)**
- Favorite Videos: save workouts and come back to them quickly
- Personal Calendar: your upcoming classes and events
- Activity History: a record of what you've attended
- Rewards & Points: earn and track points for taking part
- Personalized Experience: your saved content and activity in one place

Under the columns there's a short note that a paid membership is not needed to discover events, plus two buttons: "View Events" and "Create Your Portal Access".

## Being honest about what exists
- The portal already has events, the video library and profiles.
- Favorite Videos, Activity History and Rewards & Points aren't built yet. They'll get a small "Coming soon" tag so nobody is promised something that doesn't work yet.
- The section will show one of your existing studio photos. There is no real screenshot of the portal dashboard, so I won't make up a mockup.

## What stays the same
Fonts, colors, links, the signup flow and all existing sections stay exactly as they are.

## Technical details
- New `src/components/sections/CommunityAccess.tsx` (lucide icons, semantic tokens, image from `src/config/images.ts`).
- Imported into `src/routes/index.tsx` and `src/routes/membership.tsx`.
