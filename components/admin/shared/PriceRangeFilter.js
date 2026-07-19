"use client";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

const formatBaht = (n) => new Intl.NumberFormat("th-TH").format(n);

/**
 * Dual-thumb price range slider for filter bars. Drags update a local
 * preview only — the actual filter (and refetch) commits on release via
 * Radix's onValueCommit, so dragging doesn't spam requests.
 */
export default function PriceRangeFilter({
  min = 0,
  max = 10000,
  step = 100,
  minValue,
  maxValue,
  onCommit,
}) {
  const resolved = [
    minValue === "" || minValue == null ? min : Number(minValue),
    maxValue === "" || maxValue == null ? max : Number(maxValue),
  ];
  const [local, setLocal] = useState(resolved);

  // Keep the slider in sync when filters are reset/changed elsewhere
  // (e.g. the "ล้างตัวกรอง" button).
  useEffect(() => {
    setLocal(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minValue, maxValue]);

  return (
    <div className="pt-1.5">
      <div className="mb-2 flex justify-between text-xs text-gray-500">
        <span>฿{formatBaht(local[0])}</span>
        <span>{local[1] >= max ? `฿${formatBaht(max)}+` : `฿${formatBaht(local[1])}`}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={local}
        onValueChange={setLocal}
        onValueCommit={([lo, hi]) => {
          onCommit(lo <= min ? "" : String(lo), hi >= max ? "" : String(hi));
        }}
      />
    </div>
  );
}
