// DocxGenerator.ts
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  WidthType,
} from "docx";

import { SelectedAddress } from "@/pages/addresses";

/* interface DocxGeneratorProps {
  addresses: SelectedAddress[];
} */

export function generateDocx(addresses: SelectedAddress[]) {
  // Gerar as linhas da tabela
  const tableRows = [
    // Cabeçalho
    new TableRow({
      children: [
        "Destinatário",
        "Endereço",
        "Bairro",
        "CEP",
        "Cidade",
        "Complemento",
      ].map(
        (header) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: header.toUpperCase(),
                    bold: true,
                    size: 28, // tamanho maior para cabeçalho
                    color: "2A2A2A",
                  }),
                ],
              }),
            ],
            width: { size: 1000, type: WidthType.DXA },
          })
      ),
    }),
    // Linhas de dados
    ...addresses.flatMap((addr) =>
      Array(addr.amount) // gerar duplicado de acordo com quantidade
        .fill(null)
        .map(
          () =>
            new TableRow({
              children: [
                addr.recipient,
                addr.street,
                addr.district,
                addr.zip,
                addr.city,
                addr.complement ?? "",
              ].map(
                (text) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: (text ?? "").toString().toUpperCase(),
                            size: 24, // tamanho do texto dos dados
                          }),
                        ],
                      }),
                    ],
                    width: { size: 1000, type: WidthType.DXA },
                  })
              ),
            })
        )
    ),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Endereços para impressão",
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "enderecos.docx");
  });
}
