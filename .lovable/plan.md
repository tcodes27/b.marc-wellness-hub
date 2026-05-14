## Admin login setup

The `/admin` area uses Supabase Auth (separate from your Lovable account). No admin user exists yet — here's the path to access.

### Step 1 — You create the user in Supabase

1. In Lovable, open **Cloud → Users → Add user**.
2. Enter your email and a strong password.
3. Check "Auto Confirm User" so you can log in immediately without an email link.
4. Click **Create user**.
5. Copy the new user's **UUID** from the users table and send it to me — or just send me the email and I'll look it up.

### Step 2 — I grant the admin role

Once you've created the user, I'll run a one-line insert into the `user_roles` table:

```sql
insert into public.user_roles (user_id, role)
values ('<your-user-uuid>', 'admin');
```

This is what the `/admin` guard checks — without this row, login succeeds but the dashboard shows "Your account doesn't have admin access."

### Step 3 — You log in

Go to `/admin/login`, enter the same email + password you just created, and you'll land in the dashboard.

### Notes

- This account is **separate** from your Lovable workspace login. Use any email you control.
- Add more admins later by repeating step 2 for new users.
- Password reset works via Supabase Auth's built-in email flow (or you can reset directly in Cloud → Users).

Reply once the user is created (with the email or UUID) and I'll grant the role.