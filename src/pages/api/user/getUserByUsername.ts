import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { username }: any = req.query;

      const existingUser = await prisma.user.findFirst({
        where: {
          username: username,
        },
        include: { likes: true, followers: true, followees: true },
      });
      res.status(200).json({
        user: existingUser,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Error finding user details" });
    }
  } else {
    res.status(400).json({ message: "Invalid method" });
  }
}
