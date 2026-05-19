// SECURITY: This module previously exposed a server function that executed
// arbitrary SQL via the service role key. That capability has been removed.
//
// Database setup is now a manual, copy/paste operation performed inside the
// Supabase SQL Editor by a project owner. No code path on the deployed site
// can execute setup SQL.

import adminRoles from "../../db/admin_roles.sql?raw";
import events from "../../db/events.sql?raw";
import contentDist from "../../db/content_distribution.sql?raw";
import portalTesting from "../../db/portal_and_testing.sql?raw";
import videoLibrary from "../../db/video_library.sql?raw";
import profileAvatars from "../../db/profile_avatars.sql?raw";

export const SETUP_FILES: { name: string; sql: string }[] = [
  { name: "admin_roles.sql", sql: adminRoles },
  { name: "events.sql", sql: events },
  { name: "content_distribution.sql", sql: contentDist },
  { name: "portal_and_testing.sql", sql: portalTesting },
  { name: "video_library.sql", sql: videoLibrary },
  { name: "profile_avatars.sql", sql: profileAvatars },
];

export type SetupResult = {
  file: string;
  ok: boolean;
  error?: string;
  durationMs: number;
};
