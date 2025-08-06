import { DataGrid, GridColDef, DataGridProps } from "@mui/x-data-grid";

interface CustomDataGridProps extends Partial<DataGridProps> {
  columns: GridColDef[];
  rows: any[];
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
