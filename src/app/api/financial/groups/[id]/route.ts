import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminLevel } from "@/lib/roles"
import { Prisma } from "@/generated/prisma/client"

const groupSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  isActive: z.boolean().optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!isAdminLevel(session.user.role)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = groupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const existing = await prisma.payableGroup.findFirst({
    where: { id, companyId: session.user.companyId },
  })
  if (!existing) return new NextResponse("Not Found", { status: 404 })

  try {
    const updated = await prisma.payableGroup.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Já existe um grupo com esse nome." }, { status: 409 })
    }
    throw err
  }
}

// Nunca exclui de verdade — só inativa (isActive: false), pra não quebrar
// lançamentos antigos que já apontam pra esse grupo (ver schema.prisma).
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!isAdminLevel(session.user.role)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const { id } = await params

  const existing = await prisma.payableGroup.findFirst({
    where: { id, companyId: session.user.companyId },
  })
  if (!existing) return new NextResponse("Not Found", { status: 404 })

  await prisma.payableGroup.update({
    where: { id },
    data: { isActive: false },
  })

  return new NextResponse(null, { status: 204 })
}
