"use client";
import { type ComputedAction, computeActions } from "~/services/calculation";
import { DataTable } from "~/components/ui/data-table";
import { useSettingsStore } from "~/services/settings";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./ui/data-table-column-header";
import { useMarket } from "~/services/market";
import { skillName } from "~/services/skills";
import ItemDetail from "./item-detail";
import { useMemo } from "react";

export const columns: ColumnDef<ComputedAction>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
  },
  {
    accessorKey: "skillHrid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Skill" />
    ),
    cell: ({ row }) => <div>{skillName(row.original.skillHrid)}</div>,
  },
  {
    accessorKey: "levelRequired",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Level" sortable />
    ),
    cell: ({ row }) => row.original.levelRequired,
  },
  {
    accessorKey: "inputs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Inputs" />
    ),
    cell: ({ row }) => {
      const action = row.original;
      return (
        <>
          {action.inputs.map((input) => (
            <div key={input.itemHrid}>
              {input.count.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              x <ItemDetail hrid={input.itemHrid} />
            </div>
          ))}
        </>
      );
    },
  },
  {
    accessorKey: "inputsPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Inputs price" sortable />
    ),
    cell: ({ row }) => (
      <div className="max-w-28 text-right">
        {row.original.inputsPrice.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}
      </div>
    ),
  },
  {
    accessorKey: "outputs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Outputs" />
    ),
    cell: ({ row }) => {
      const action = row.original;
      return (
        <>
          {action.outputs.map((output) => (
            <div key={output.itemHrid}>
              {output.count.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              x <ItemDetail hrid={output.itemHrid} />
            </div>
          ))}
        </>
      );
    },
  },
  {
    accessorKey: "outputsPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Outputs price" sortable />
    ),
    cell: ({ row }) => (
      <div className="max-w-28 text-right">
        {row.original.outputsPrice.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}
      </div>
    ),
  },
  {
    accessorKey: "outputMaxBidAskSpread",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Output spread" sortable />
    ),
    cell: ({ row }) => (
      <div className="max-w-28 text-right">
        {(row.original.outputMaxBidAskSpread * 100).toLocaleString(undefined, {
          maximumSignificantDigits: 2,
        }) + "%"}
      </div>
    ),
  },
  {
    accessorKey: "actionsPerHour",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions/h" sortable />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.actionsPerHour.toFixed(0)}</div>
    ),
  },
  {
    accessorKey: "profit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Profit/h" sortable />
    ),
    cell: ({ row }) => (
      <div className="max-w-28 text-right">
        {row.original.profit.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}
      </div>
    ),
  },
];

export function ActionsDataTable() {
  const settings = useSettingsStore((state) => state.settings);
  const market = useMarket();

  const visibleColumns = useMemo(() => {
    if (settings.filters.showAutoTeas) {
      return columns;
    }

    return columns.filter((column) => column.id !== "teas");
  }, [settings.filters.showAutoTeas]);

  const actions = computeActions(settings, market);

  return (
    <DataTable
      columns={visibleColumns}
      data={actions}
      initialSorting={[{ id: "profit", desc: true }]}
    />
  );
}
