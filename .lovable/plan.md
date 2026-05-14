## Issue

The modal insert fails with `invalid input syntax for type uuid: ""`. `useAdmin()` initializes `userId` as `""` and the modal forwards it as `created_by`. Postgres rejects an empty string for a uuid column.

## Fix

In `src/components/admin/NewPostModal.tsx`, coerce empty `userId` to `null`:

```ts
created_by: userId || null,
```

That's the only change needed. The distribution columns are now in the DB, so the primary insert path will succeed once `created_by` is valid.
