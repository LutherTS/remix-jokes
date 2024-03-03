import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { logout } from "~/utils/session.server";

// Simply put, actions write (POST)...
export const action = async ({ request }: ActionFunctionArgs) =>
  logout(request);

// ...and loaders read (GET).
export const loader = async () => redirect("/");
// This looks like a default to confirm that this is not a page,
// and therefore showing up here in the URL if for some reason the
// action fails should just send you to the root path where it all
// begins.

// This is the only route so far that does not have any JSX.
// Meaning the only route that doesn't export a React component.
// In Next.js, this would a route.ts file.
