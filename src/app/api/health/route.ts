import prisma from "@/lib/prisma";

export const GET = async () => {
  // Test prisma
  const result = await prisma.$queryRaw`SELECT 1`;
  if (result) {
    return new Response("OK", { status: 200 });
  } else {
    return new Response("Error", { status: 500 });
  }
};
