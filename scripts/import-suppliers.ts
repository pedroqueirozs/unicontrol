/**
 * Script de importação de fornecedores em massa, a partir do relatório
 * exportado do sistema antigo (M3Soft) em PDF, já convertido pro Claude Code
 * em texto e salvo em scripts/fornecedores-raw.txt.
 *
 * O formato desse .txt é o texto bruto extraído do PDF: cada fornecedor vira
 * um bloco de linhas começando com o código antigo de 6 dígitos (ex: "000002
 * BRASPRESS...") e terminando na linha que contém "CIDADE:". Esse layout é
 * bagunçado (rótulo e valor às vezes trocados de linha por causa de como o
 * PDF foi gerado), então o parser abaixo foi construído e conferido contra
 * várias linhas do arquivo original antes de rodar de verdade.
 *
 * Como usar:
 *   1. Simulação (não grava nada, só mostra o que seria criado/ignorado):
 *      npx tsx scripts/import-suppliers.ts
 *
 *   2. Depois de conferir a simulação, aplicar de verdade:
 *      npx tsx scripts/import-suppliers.ts --apply
 */

import "dotenv/config"
import fs from "fs"
import path from "path"
import { prisma } from "../src/lib/prisma"

const RAW_FILE = path.resolve(process.cwd(), "scripts/fornecedores-raw.txt")

// Mesma máscara usada em src/components/contact-modal.tsx — reaproveitada
// aqui pra os fornecedores importados ficarem formatados igual aos
// cadastrados manualmente pelo formulário.
function maskCnpjCpf(digits: string): string {
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
}

function normalizeDoc(raw: string | null): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, "")
  if (digits.length !== 11 && digits.length !== 14) return null
  if (/^(\d)\1+$/.test(digits)) return null // tudo igual (ex: 00000000000000) = placeholder, não é documento real
  return digits
}

type ParsedHeader = { code: string; name: string; doc: string | null; phoneBlob: string }

function parseHeader(line: string): ParsedHeader {
  const codeMatch = line.match(/^(\d{6})\s+(.*)$/)
  if (!codeMatch) throw new Error(`Linha de cabeçalho inesperada: ${line}`)
  const code = codeMatch[1]
  const rest = codeMatch[2]

  const cnpjMatch = rest.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/)
  const cpfMatch = !cnpjMatch ? rest.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/) : null
  const docMatch = cnpjMatch ?? cpfMatch

  if (!docMatch) {
    return { code, name: rest.trim(), doc: null, phoneBlob: "" }
  }

  const name = rest.slice(0, docMatch.index).trim()
  const phoneBlob = rest.slice((docMatch.index ?? 0) + docMatch[0].length).trim()
  return { code, name, doc: docMatch[0], phoneBlob }
}

const BAIRRO_PREFIXES = [
  "JARDIM", "VILA", "PARQUE", "CENTRO", "SETOR", "CONJUNTO", "RESIDENCIAL",
  "DISTRITO", "CIDADE", "CHACARA", "LOTEAMENTO", "COLONIA", "BAIRRO", "PQ.", "PQ",
]

function splitStreet(streetLine: string) {
  let street: string | null = null
  let number: string | null = null
  let neighborhood: string | null = null

  const lastComma = streetLine.lastIndexOf(",")
  if (lastComma >= 0) {
    street = streetLine.slice(0, lastComma).trim() || null
    const tail = streetLine.slice(lastComma + 1).trim()
    const numMatch = tail.match(/^(\d+)\s*(.*)$/)
    if (numMatch) {
      number = numMatch[1]
      neighborhood = numMatch[2].trim() || null
    } else {
      neighborhood = tail || null
    }
  } else {
    const words = streetLine.split(" ")
    let splitIdx = -1
    for (let i = 1; i < words.length; i++) {
      if (BAIRRO_PREFIXES.includes(words[i])) {
        splitIdx = i
        break
      }
    }
    if (splitIdx >= 0) {
      street = words.slice(0, splitIdx).join(" ").trim() || null
      neighborhood = words.slice(splitIdx).join(" ").trim() || null
    } else {
      street = streetLine
    }
  }

  return { street, number, neighborhood }
}

type ParsedSupplier = {
  legacyCode: string
  name: string
  docDigits: string | null
  phone: string | null
  street: string | null
  number: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  email: string | null
}

function parseEntry(block: string): ParsedSupplier {
  const lines = block.split("\n").map((l) => l.trim()).filter((l) => l.length > 0)
  const { code, name, doc, phoneBlob } = parseHeader(lines[0])

  const rest = lines.slice(1)
  const trailerIdx = rest.findIndex((l) => l.startsWith("CIDADE:"))
  const trailer = trailerIdx >= 0 ? rest[trailerIdx] : ""
  // O rótulo "BAIRRO:" às vezes vem sozinho numa linha, às vezes colado no
  // fim da própria linha de endereço (quando a cidade ficou em branco na
  // fonte) — remove esse rótulo de qualquer linha antes de decidir o que é
  // endereço e o que é cidade.
  const content = rest
    .slice(0, trailerIdx >= 0 ? trailerIdx : rest.length)
    .map((l) => l.replace(/\s*BAIRRO:\s*$/, "").trim())
    .filter((l) => l.length > 0)

  // Nome de cidade não tem número nem vírgula — se a última linha restante
  // parece endereço (tem vírgula ou dígito), é porque a cidade ficou em
  // branco na fonte e essa linha inteira é, na verdade, endereço.
  let city: string | null = null
  let streetLine: string | null = null
  if (content.length === 1) {
    if (/[,\d]/.test(content[0])) {
      streetLine = content[0]
    } else {
      city = content[0]
    }
  } else if (content.length >= 2) {
    const lastLine = content[content.length - 1]
    if (/[,\d]/.test(lastLine)) {
      streetLine = content.join(" ")
    } else {
      city = lastLine
      streetLine = content.slice(0, -1).join(" ")
    }
  }

  let state: string | null = null
  let email: string | null = null
  if (trailer) {
    const ufMatch = trailer.match(/UF:\s*([A-Z]{0,2})\s*E-MAIL:/)
    state = ufMatch && ufMatch[1] ? ufMatch[1].trim() : null
    const emailMatch = trailer.match(/E-MAIL:\s*(.*)$/)
    email = emailMatch && emailMatch[1].includes("@") ? emailMatch[1].trim().toLowerCase() : null
  }

  const { street, number, neighborhood } = streetLine
    ? splitStreet(streetLine)
    : { street: null, number: null, neighborhood: null }

  // Algumas cidades vêm com o UF grudado (ex: "APARECIDA - SP") mesmo já
  // tendo o UF certo separado no rodapé — remove a repetição.
  if (city && state) {
    city = city.replace(new RegExp(`\\s*-\\s*${state}$`), "").trim()
  }

  return {
    legacyCode: code,
    name,
    docDigits: normalizeDoc(doc),
    phone: phoneBlob || null,
    street,
    number,
    neighborhood,
    city,
    state,
    email,
  }
}

function parseRawFile(content: string): ParsedSupplier[] {
  const lines = content.split(/\r?\n/)
  const blocks: string[] = []
  let current: string[] = []
  for (const line of lines) {
    if (/^\d{6}\s/.test(line)) {
      if (current.length) blocks.push(current.join("\n"))
      current = [line]
    } else if (current.length) {
      current.push(line)
    }
  }
  if (current.length) blocks.push(current.join("\n"))
  return blocks.map(parseEntry)
}

async function main() {
  const apply = process.argv.includes("--apply")

  if (!fs.existsSync(RAW_FILE)) {
    console.error(`\n❌  Arquivo não encontrado: ${RAW_FILE}\n`)
    process.exit(1)
  }

  const company = await prisma.company.findFirst()
  if (!company) {
    console.error("\n❌  Nenhuma empresa encontrada no banco. Rode o seed primeiro.\n")
    process.exit(1)
  }
  const companyId = company.id

  const content = fs.readFileSync(RAW_FILE, "utf-8")
  const parsed = parseRawFile(content)

  const withDoc = parsed.filter((p) => p.docDigits !== null)
  const noDoc = parsed.filter((p) => p.docDigits === null)

  // Não confia só na regra "mesmo CNPJ pode ter múltiplos cadastros" (RN-20)
  // pra criar duplicado às cegas — se o CNPJ já existe no banco de destino
  // (ex: fornecedor já cadastrado manualmente, com outro nome), pula em vez
  // de criar de novo.
  const existing = await prisma.supplier.findMany({
    where: { companyId },
    select: { cnpj: true, name: true, code: true },
  })
  const existingByDigits = new Map(existing.map((e) => [e.cnpj.replace(/\D/g, ""), e]))

  const alreadyExists = withDoc.filter((p) => existingByDigits.has(p.docDigits!))
  const toCreate = withDoc.filter((p) => !existingByDigits.has(p.docDigits!))
  const skipped = noDoc

  console.log(`\n📄  Empresa: ${company.name}`)
  console.log(`📦  ${parsed.length} fornecedor(es) encontrado(s) no relatório`)
  console.log(`✅  ${toCreate.length} serão importados`)
  console.log(`⚠️   ${skipped.length} sem CNPJ/CPF válido — NÃO serão importados:\n`)
  for (const s of skipped) {
    console.log(`     [${s.legacyCode}] ${s.name}`)
  }
  console.log(`\n🔁  ${alreadyExists.length} já existem no banco (mesmo CNPJ/CPF) — pulados, não duplicados:\n`)
  for (const s of alreadyExists) {
    const match = existingByDigits.get(s.docDigits!)!
    console.log(`     [${s.legacyCode}] "${s.name}" == ${match.code} "${match.name}" (${match.cnpj})`)
  }

  console.log(`\n${"=".repeat(70)}`)
  console.log(apply ? "MODO: aplicando de verdade (--apply)" : "MODO: simulação (nada será gravado — rode com --apply pra aplicar)")
  console.log(`${"=".repeat(70)}\n`)

  const last = await prisma.supplier.findFirst({
    where: { companyId },
    orderBy: { code: "desc" },
    select: { code: true },
  })
  let nextNum = last ? parseInt(last.code.replace("F-", ""), 10) + 1 : 1

  let created = 0
  for (const s of toCreate) {
    const code = `F-${String(nextNum).padStart(3, "0")}`
    const cnpj = maskCnpjCpf(s.docDigits!)

    const addressBits = [
      s.street,
      s.number ? `nº ${s.number}` : null,
      s.neighborhood,
      s.city && s.state ? `${s.city}/${s.state}` : s.city,
    ].filter(Boolean).join(", ")

    console.log(
      `  ${apply ? "✅" : "🔎"} ${code}  ${s.name}  |  ${cnpj}` +
        (s.phone ? `  |  tel: ${s.phone}` : "") +
        (addressBits ? `  |  ${addressBits}` : "")
    )

    if (apply) {
      await prisma.supplier.create({
        data: {
          code,
          name: s.name,
          cnpj,
          street: s.street,
          number: s.number,
          neighborhood: s.neighborhood,
          city: s.city,
          state: s.state,
          phone: s.phone,
          email: s.email,
          companyId,
        },
      })
    }

    nextNum++
    created++
  }

  console.log(`\n✔   ${apply ? "Importação concluída" : "Simulação concluída"}: ${created} fornecedor(es), ${skipped.length} ignorado(s).\n`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error("\n❌  Erro durante a importação:", e.message)
  prisma.$disconnect()
  process.exit(1)
})
