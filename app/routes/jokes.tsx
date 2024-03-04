import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import stylesUrl from "~/styles/jokes.css";
import { db, prisma } from "~/utils/db.server";
// prisma via remember works just fine
import { getUser } from "~/utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const loader = async ({
  request,
}: // LoaderFunctionArgs automatically types request as Request
LoaderFunctionArgs) => {
  // return json({
  // jokesListItems: await prisma.joke.findMany({
  const jokesListItems = await prisma.joke.findMany({
    // honestly a lot more straightforward in Postgres imo
    // orderBy: {
    //   name: "asc",
    // },
    // (previous code above)
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
    take: 5,
  });
  const user = await getUser(request);

  return json({ jokesListItems, user });
};

export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are some of the most recent jokes to check out:</p>
            {/* <ul>
              <li>
                <Link to="some-joke-id">Hippo</Link>
              </li>
            </ul> */}
            <ul>
              {/* {data.jokesListItems.map((joke) => ( */}
              {data.jokesListItems.map(({ id, name }) => (
                <li key={id}>
                  <Link prefetch="intent" to={id}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
            {/* <Link to="new" className="button">
              Add your own
            </Link> */}
            {/* MY CODE */}
            {data.user ? (
              <Link to="new" className="button">
                Add your own
              </Link>
            ) : (
              <Link to="/login" className="button">
                Add your own
              </Link>
            )}
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="jokes-footer">
        <div className="container">
          <Link reloadDocument to="/jokes.rss">
            RSS
          </Link>
        </div>
      </footer>
    </div>
  );
}
