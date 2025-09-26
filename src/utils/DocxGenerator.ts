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
  AlignmentType,
} from "docx";

import { SelectedAddress } from "@/pages/addresses";

export async function generateDocx(addresses: SelectedAddress[]) {
  const recipientBlock = (addr: SelectedAddress) => [
    new Paragraph({
      children: [
        new TextRun({ text: "DESTINATÁRIO: ", bold: true, size: 28 }),
        new TextRun({
          text: addr.recipient?.toUpperCase() ?? "",
          size: 30,
          bold: true,
        }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Endereço: ", bold: true, size: 22 }),
        new TextRun({ text: addr.street ?? "", size: 22 }),
        new TextRun({
          text: addr.complement ? ` - ${addr.complement}` : "",
          size: 22,
        }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Bairro: ", bold: true, size: 22 }),
        new TextRun({ text: addr.district ?? "", size: 22 }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "CEP: ", bold: true, size: 22 }),
        new TextRun({ text: addr.zip ?? "", size: 22 }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Cidade: ", bold: true, size: 22 }),
        new TextRun({
          text: `${addr.city ?? ""} `,
          size: 22,
        }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 50 },
    }),
  ];

  const senderBlock = () => [
    new Paragraph({
      children: [
        new TextRun({
          text: "SÃO JOSÉ ARTIGOS LITÚRGICOS LTDA",
          size: 24,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Rua João Rebelo, 839 - Cândida Câmara",
          size: 18,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Montes Claros - MG - 39401-036", size: 18 }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Tel.: (38) 3321-4705 | WhatsApp: (38) 9 9895-3646",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 50 },
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
                children: [
                  ...recipientBlock(addr),
                  new Paragraph({
                    children: [new TextRun({ text: " ", size: 1, break: 1 })],
                    border: {
                      top: {
                        style: BorderStyle.SINGLE,
                        size: 2,
                        color: "000000",
                      },
                    },
                    spacing: { before: 100, after: 100 },
                  }),
                  ...senderBlock(),
                ],

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
    saveAs(blob, "Endereços.docx");
  });
}
  