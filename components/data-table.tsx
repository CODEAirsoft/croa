import { ReactNode } from "react";

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  wrapClassName,
  tableClassName,
}: {
  columns: Column<T>[];
  rows: T[];
  wrapClassName?: string;
  tableClassName?: string;
}) {
  return (
    <div className={`table-wrap${wrapClassName ? ` ${wrapClassName}` : ""}`}>
      <table className={`data-table${tableClassName ? ` ${tableClassName}` : ""}`}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={String(column.key)}>
                  {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
