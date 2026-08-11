import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminLevel } from "@/lib/roles"

const paymentMethodSchema = z.object({
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

  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { companyId: session.user.companyId },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  })

  return NextResponse.json(paymentMethods)
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
  const parsed = paymentMethodSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const paymentMethod = await prisma.paymentMethod.create({
    data: {
      name: parsed.data.name,
      companyId: session.user.companyId,
    },
  })

  return NextResponse.json(paymentMethod, { status: 201 })
}
