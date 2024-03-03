import bcrypt from "bcryptjs";

import { prisma } from "./db.server";

type LoginForm = {
  password: string;
  username: string;
};

export async function login({ password, username }: LoginForm) {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  if (!user) {
    return null;
  }

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) {
    return null;
  }

  // return { id: user.id, username };
  return { id: user.id, username: user.username };
}
