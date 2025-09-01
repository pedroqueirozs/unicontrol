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

export function generateDocx(addresses: SelectedAddress[]) {
  const addressRows = addresses.flatMap((addr) =>
    Array(addr.amount)
      .fill(null)
      .map(
        () =>
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "DESTINATÁRIO: ",
                        bold: true,
                        size: 30,
                      }),
                      new TextRun({
                        text: addr.recipient?.toUpperCase() ?? "",
                        size: 30,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "ENDEREÇO: ", bold: true, size: 30 }),
                      new TextRun({
                        text: addr.street?.toUpperCase() ?? "",
                        size: 30,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "BAIRRO: ", bold: true, size: 30 }),
                      new TextRun({
                        text: addr.district?.toUpperCase() ?? "",
                        size: 30,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "CEP: ", bold: true, size: 30 }),
                      new TextRun({
                        text: addr.zip?.toUpperCase() ?? "",
                        size: 30,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "CIDADE: ", bold: true, size: 30 }),
                      new TextRun({
                        text: addr.city?.toUpperCase() ?? "",
                        size: 30,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "COMPLEMENTO: ",
                        bold: true,
                        size: 30,
                      }),
                      new TextRun({
                        text: addr.complement?.toUpperCase() ?? "",
                        size: 30,
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: "000000",
                  },
                  left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 4,
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
            rows: addressRows,
          }),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "enderecos.docx");
  });
}
