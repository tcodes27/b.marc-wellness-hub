import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/content/new")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/content/$id", params: { id: "new" } });
  },
});
