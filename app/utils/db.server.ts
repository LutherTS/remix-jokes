import { PrismaClient } from "@prisma/client";

import { singleton } from "./singleton.server";

// Hard-code a unique key, so we can look up the client when this module gets re-imported
export const db = singleton("prisma", () => new PrismaClient());

//

import { remember } from "@epic-web/remember";
// https://www.npmjs.com/package/@epic-web/remember

export const prisma = remember("prisma", () => new PrismaClient());
