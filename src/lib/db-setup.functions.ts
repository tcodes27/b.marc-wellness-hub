import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

import adminRoles from "../../db/admin_roles.sql?raw";
import events from "../../db/events.sql?raw";
import contentDist from "../../db/content_distribution.sql?raw";
import portalTesting from "../../db/portal_and_testing.sql?raw";

const FILES: { name: string; sql: string }[] = [
  { name: "admin_roles.sql", sql: adminRoles },
  { name: "events.sql", sql: events },
  { name: "content_distribution.sql", sql: contentDist },
  { name: "portal_and_testing.sql", sql: portalTesting },
];

export const BOOTSTRAP_SQL = `create or replace function public.exec_sql(sql text)
returns void language plpgsql security definer
set search_path = public as $$ begin execute sql; end; $$;
revoke all on function public.exec_sql(text) from public, anon, authenticated;`;

export type SetupResult = {
  file: string;
  ok: boolean;
  error?: string;
  durationMs: number;
};

export const runDatabaseSetup = createServerFn({ method: "POST" }).handler(
  async (): Promise<{
    results: SetupResult[];
    needsBootstrap: boolean;
    bootstrapSql: string;
  }> => {
    const results: SetupResult[] = [];
    let needsBootstrap = false;

    for (const f of FILES) {
      const start = Date.now();
      try {
        const { error } = await supabaseAdmin.rpc("exec_sql", { sql: f.sql });
        if (error) {
          const msg = error.message || String(error);
          if (
            /function .*exec_sql.* does not exist/i.test(msg) ||
            /Could not find the function/i.test(msg) ||
            /PGRST202/i.test(msg)
          ) {
            needsBootstrap = true;
          }
          results.push({ file: f.name, ok: false, error: msg, durationMs: Date.now() - start });
        } else {
          results.push({ file: f.name, ok: true, durationMs: Date.now() - start });
        }
      } catch (e: any) {
        results.push({
          file: f.name,
          ok: false,
          error: e?.message ?? String(e),
          durationMs: Date.now() - start,
        });
      }
    }

    return { results, needsBootstrap, bootstrapSql: BOOTSTRAP_SQL };
  },
);
