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
  BorderStyle,
} from "docx";

import { SelectedAddress } from "@/pages/addresses";

export async function generateDocx(addresses: SelectedAddress[]) {
  const recipientBlock = (addr: SelectedAddress) => [
    new Paragraph({
      children: [
        new TextRun({ text: "DESTINATÁRIO: ", bold: true, size: 25 }),
        new TextRun({
          text: addr.recipient?.toUpperCase() ?? "",
          size: 25,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "ENDEREÇO: ", bold: true, size: 25 }),
        new TextRun({ text: addr.street?.toUpperCase() ?? "", size: 25 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "BAIRRO: ", bold: true, size: 25 }),
        new TextRun({ text: addr.district?.toUpperCase() ?? "", size: 25 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "CEP: ", bold: true, size: 25 }),
        new TextRun({ text: addr.zip?.toUpperCase() ?? "", size: 25 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "CIDADE: ", bold: true, size: 25 }),
        new TextRun({ text: addr.city?.toUpperCase() ?? "", size: 25 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "COMPLEMENTO: ", bold: true, size: 25 }),
        new TextRun({ text: addr.complement?.toUpperCase() ?? "", size: 25 }),
      ],
    }),
  ];
  const senderBlock = () => [
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [
        new TextRun({
          text: "REMETENTE",
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "SÃO JOSÉ ARTIGOS LITÚRGICOS LTDA",
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Rua João Rebelo, 839 - Cândida Câmara",
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Montes Claros - MG - 39401-036", size: 22 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Tel.: (38) 3321-4705 | Tel.: (38) 3321-1025 | WhatsApp.: (38) 9 9895-3646",
          size: 22,
        }),
      ],
    }),
  ];

  const labelRows = addresses.flatMap((addr) =>
    Array(addr.amount)
      .fill(null)
      .map(
        () =>
          new TableRow({
            children: [
              new TableCell({
                children: [...recipientBlock(addr), ...senderBlock()],
                borders: {
                  top: {
                    style: BorderStyle.SINGLE,
                    size: 6,
                    color: "000000",
                  },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 6,
                    color: "000000",
                  },
                  left: {
                    style: BorderStyle.SINGLE,
                    size: 6,
                    color: "000000",
                  },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 6,
                    color: "000000",
                  },
                },
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
              }),
            ],
          })
      )
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: labelRows,
          }),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "endereços.docx");
  });
}
