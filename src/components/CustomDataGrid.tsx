import { DataGrid, GridColDef, DataGridProps } from "@mui/x-data-grid";

type RowData = {
  id: string;
  name: string;
  document_number: string;
  city: string;
  uf: string;
  transporter: string;
  shipping_date: string;
  situation: string;
  delivery_forecast: string;
  delivery_date?: string | null | undefined;
  notes: string;
};
interface CustomDataGridProps extends Partial<DataGridProps> {
  columns: GridColDef[];
  rows: RowData[];
  height?: number;
}

export function CustomDataGrid({
  columns,
  rows,
  height = 500,
  ...rest
}: CustomDataGridProps) {
  return (
    <div style={{ height: height, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} editMode="cell" {...rest} />
    </div>
  );
}
