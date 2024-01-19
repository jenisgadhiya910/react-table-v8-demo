import { Column } from '@tanstack/react-table'
import { RowData, Table } from '@tanstack/table-core'

declare module '@tanstack/table-core' {
  interface FilterRenderProps<T extends RowData> {
    column: Column<T, unknown>
    table: Table<T>
  }

  interface ColumnMeta<TData extends RowData> {
    align?: any;
    filterRender?: (props: FilterRenderProps<TData>) => JSX.Element
  }
}
