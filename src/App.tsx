import React from 'react'

import { Button, CssBaseline, InputLabel, MenuItem, TextField } from '@mui/material'
import { createColumnHelper, FilterFn, FilterRenderProps, Row } from '@tanstack/react-table'

import { Page } from './Page'
import { Table } from './Table'
import { makeData, Person } from './utils'

const filterGreaterThan: FilterFn<any> = (row, columnId, value) => {
  const rowValue = row.getValue<number>(columnId)
  return rowValue >= value
}

filterGreaterThan.autoRemove = (val: any) => typeof val !== 'number'

function SelectColumnFilter({
  column: { id, columnDef, setFilterValue, getFilterValue },
  table: { getPreFilteredRowModel },
}: FilterRenderProps<Person>) {
  const options = React.useMemo(() => {
    const _options = new Set<any>()
    getPreFilteredRowModel().flatRows.forEach((row) => {
      _options.add(row.getValue(id))
    })
    return [...Array.from(_options.values())]
  }, [id, getPreFilteredRowModel])
  const columnFilterValue = getFilterValue()

  return (
    <TextField
      select
      label={columnDef.header as string}
      value={columnFilterValue || ''}
      onChange={(e) => {
        setFilterValue(e.target.value || undefined)
      }}
      variant="standard"
    >
      <MenuItem value="">All</MenuItem>
      {options.map((option, i) => (
        <MenuItem key={i} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  )
}

const getMinMax = (rows: Row<Person>[], id: string) => {
  let min = rows.length ? rows[0].getValue<number>(id) : 0
  let max = rows.length ? rows[0].getValue<number>(id) : 0
  rows.forEach((row) => {
    min = Math.min(row.getValue<number>(id), min)
    max = Math.max(row.getValue<number>(id), max)
  })
  return [min, max]
}

function SliderColumnFilter({
  column: { id, columnDef, setFilterValue, getFilterValue },
  table: { getPreFilteredRowModel },
}: FilterRenderProps<Person>) {
  const [min, max] = React.useMemo(() => getMinMax(getPreFilteredRowModel().flatRows, id), [getPreFilteredRowModel, id])

  const columnFilterValue = getFilterValue()

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <TextField
        name={id}
        label={columnDef.header as string}
        type="range"
        inputProps={{
          min,
          max,
        }}
        value={columnFilterValue || min}
        onChange={(e) => {
          setFilterValue(parseInt(e.target.value, 10))
        }}
        variant="standard"
      />
      <Button variant="outlined" style={{ width: 60, height: 36 }} onClick={() => setFilterValue(undefined)}>
        Off
      </Button>
    </div>
  )
}

const useActiveElement = () => {
  const [active, setActive] = React.useState(document.activeElement)

  const handleFocusIn = () => {
    setActive(document.activeElement)
  }

  React.useEffect(() => {
    document.addEventListener('focusin', handleFocusIn)
    return () => {
      document.removeEventListener('focusin', handleFocusIn)
    }
  }, [])

  return active
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
function NumberRangeColumnFilter({
  column: { id, columnDef, setFilterValue, getFilterValue },
  table: { getPreFilteredRowModel },
}: FilterRenderProps<Person>) {
  const [min, max] = React.useMemo(() => getMinMax(getPreFilteredRowModel().flatRows, id), [getPreFilteredRowModel, id])
  const focusedElement = useActiveElement()
  const hasFocus = focusedElement && (focusedElement.id === `${id}_1` || focusedElement.id === `${id}_2`)
  const columnFilterValue = (getFilterValue() as [number, number]) || [0, 0]

  return (
    <>
      <InputLabel htmlFor={id} shrink focused={!!hasFocus}>
        {columnDef.header as string}
      </InputLabel>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingTop: 5,
        }}
      >
        <TextField
          id={`${id}_1`}
          value={columnFilterValue[0] || ''}
          type="number"
          onChange={(e) => {
            const val = e.target.value
            setFilterValue((old: [number, number]) => [val ? parseInt(val, 10) : undefined, old[1]])
          }}
          placeholder={`Min (${min})`}
          style={{
            width: '70px',
            marginRight: '0.5rem',
          }}
          variant="standard"
        />
        to
        <TextField
          id={`${id}_2`}
          value={columnFilterValue[1] || ''}
          type="number"
          onChange={(e) => {
            const val = e.target.value
            setFilterValue((old: [number, number]) => [old[0], val ? parseInt(val, 10) : undefined])
          }}
          placeholder={`Max (${max})`}
          style={{
            width: '70px',
            marginLeft: '0.5rem',
          }}
          variant="standard"
        />
      </div>
    </>
  )
}

const columnHelper = createColumnHelper<Person>()

const columns = [
  columnHelper.group({
    header: 'Name',
    columns: [
      columnHelper.accessor('firstName', {
        header: 'First Name',
      }),
      columnHelper.accessor('lastName', {
        header: 'Last Name',
      }),
    ],
  }),
  columnHelper.group({
    header: 'Info',
    columns: [
      columnHelper.accessor('age', {
        header: 'Age',
        size: 120,
        minSize: 80,
        filterFn: 'equals',
        enableGrouping: false,
        enableSorting: true,
        meta: {
          align: 'right',
          filterRender: SliderColumnFilter,
        },
      }),
      columnHelper.accessor('visits', {
        header: 'Visits',
        size: 120,
        minSize: 100,
        filterFn: 'inNumberRange',
        aggregationFn: 'sum',
        enableSorting: true,
        meta: {
          align: 'right',
          filterRender: NumberRangeColumnFilter,
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        filterFn: 'includesString',
        meta: {
          filterRender: SelectColumnFilter,
        },
      }),
      columnHelper.accessor('progress', {
        header: 'Profile Progress',
        filterFn: filterGreaterThan,
        meta: {
          filterRender: SliderColumnFilter,
        },
      }),
    ],
  }),
]

const App: React.FC = () => {
  const [data] = React.useState<Person[]>(() => makeData(380))

  return (
    <Page>
      <CssBaseline />
      <h3>React Table Demo</h3>
      <Table<Person> name="testTable" columns={columns} data={data} />
    </Page>
  )
}

export default App
