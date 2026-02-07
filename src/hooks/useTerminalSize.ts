import { useEffect, useState } from "react";

interface TerminalSize {
  columns: number;
  rows: number;
  cellWidth: number; // 2 at 80cols, 3 at 120+
}

export function useTerminalSize(): TerminalSize {
  const [size, setSize] = useState<TerminalSize>(() => compute());

  function compute(): TerminalSize {
    const columns = process.stdout.columns || 80;
    const rows = process.stdout.rows || 24;
    return {
      columns,
      rows,
      cellWidth: columns >= 120 ? 3 : 2,
    };
  }

  useEffect(() => {
    const handler = () => setSize(compute());
    process.stdout.on("resize", handler);
    return () => {
      process.stdout.off("resize", handler);
    };
  }, []);

  return size;
}
