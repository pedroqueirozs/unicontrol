import "dotenv/config"
import { prisma } from "../src/lib/prisma"

async function main() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { code: "asc" },
    select: { code: true, name: true, cnpj: true },
  })
  console.log(`Total existente: ${suppliers.length}\n`)
  for (const s of suppliers) {
    console.log(`  ${s.code}  ${s.name}  |  ${s.cnpj}`)
  }
  await prisma.$disconnect()
}
main()
