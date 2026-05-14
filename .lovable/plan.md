The admin dashboard is failing because the `/admin` index dashboard is rendering without the `AdminContext` provider from the admin layout. The console error confirms this: `useAdmin must be used inside admin layout` in `admin.index.tsx`.

Plan:

1. Fix the admin route context boundary
   - Keep `/admin` as the protected layout route with `<Outlet />` and `AdminContext.Provider`.
   - Adjust the dashboard/index route so it is definitely treated as the child dashboard route of `/admin`, not as a standalone route path that can render outside the layout.
   - Ensure `/admin` resolves to the dashboard view inside the admin layout.

2. Preserve the current Supabase auth flow
   - Keep the existing `getSession()` check, role RPC check, redirects to `/admin/login`, and auth logging.
   - Avoid changing database/RLS logic since the current failure is a React routing/context error, not the `user_roles` record.

3. Clean up route navigation consistency
   - Confirm admin links target user-facing paths like `/admin`, `/admin/members`, and `/admin/login`.
   - Make sure login redirects after successful Supabase sign-in land on `/admin` and render through the protected admin layout.

4. Verify the fix
   - Check the generated route structure after changes.
   - Validate that the previous console error can no longer occur because `Overview` will only render under `AdminContext.Provider`.

Expected result:
- Unauthenticated `/admin` users go to `/admin/login`.
- Successful login redirects to `/admin`.
- `/admin` renders the admin shell plus dashboard overview instead of the error boundary.