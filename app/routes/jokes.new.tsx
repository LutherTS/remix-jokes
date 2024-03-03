import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

import { prisma } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
// Got it. That's what allows the currently logged in user
// to be the jokester of the joke being create in this
// jokes/new route.
import { requireUserId } from "~/utils/session.server";

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "That joke is too short";
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return "That joke's name is too short";
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");
  // we do this type check to be extra sure and to make TypeScript happy
  // we'll explore validation next!
  if (typeof content !== "string" || typeof name !== "string") {
    // throw new Error("Form not submitted correctly.");
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  const fieldErrors = {
    content: validateJokeContent(content),
    name: validateJokeName(name),
  };

  const fields = { content, name };
  // not sure I understand this first line
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const joke = await prisma.joke.create({
    // data: { name, content },
    // data: fields,
    data: { ...fields, jokesterId: userId },
  });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              defaultValue={actionData?.fields?.name}
              type="text"
              name="name"
              aria-invalid={Boolean(actionData?.fieldErrors?.name)}
              aria-errormessage={
                actionData?.fieldErrors?.name ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className="form-validation-error" id="name-error" role="alert">
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={Boolean(actionData?.fieldErrors?.content)}
              aria-errormessage={
                actionData?.fieldErrors?.content ? "content-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              id="content-error"
              role="alert"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p className="form-validation-error" role="alert">
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}

/* Personal notes
I'm honestly thinking I should use SQLite for my project. Perhaps even redo it in Remix to that end. Trying to make it fit with Prisma too. Having the database inside my project at that little scope is definitely going to make it a whole lot faster. Then I can go back to Next.js once I need the project to reach real production grade.
...
I mean if you make a little website do you even need SQL if users won't be able to do some CRUD on it? Do you even need an actual database? Can't you have you own files ready up in there just like documentations do? It's all a matter of scale, and I ought to be able to work at any scale.
...
P.S.: YES.
...
What would be nice at this point or eventually would be to hide the "Add your own" button if you're not connected (I can't believe I now know how to login and even talk casually about the next steps), and also redirect to login on the route /jokes/new if the user is not logged in, with the added bonus that the query params should indicate and be used to tell that the user got redirected there from /jokes/new because they weren't connected.
*/
