import { DataGrid, GridColDef, DataGridProps } from "@mui/x-data-grid";

type RowData = {
  id: string;
  customer: string;
  invoice: string;
  city: string;
  state: string;
  transporter: string;
  shipping: string;
  situation: string;
  estimated_delivery: string;
  delivery_date: string;
  observation: string;
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
