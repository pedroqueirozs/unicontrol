import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminLevel } from "@/lib/roles"
import { Prisma } from "@/generated/prisma/client"

const groupSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.companyId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!isAdminLevel(session.user.role)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const groups = await prisma.payableGroup.findMany({
    where: { companyId: session.user.companyId },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  })

  return NextResponse.json(groups)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!isAdminLevel(session.user.role)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const body = await req.json()
  const parsed = groupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  try {
    const group = await prisma.payableGroup.create({
      data: {
        name: parsed.data.name,
        companyId: session.user.companyId,
      },
    })

    return NextResponse.json(group, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Já existe um grupo com esse nome." }, { status: 409 })
    }
    throw err
  }
}
