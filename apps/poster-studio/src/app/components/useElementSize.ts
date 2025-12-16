import { useEffect, useRef, useState } from "react";

type Size = { width: number; height: number };

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const next = { width: el.clientWidth, height: el.clientHeight };
      setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next));
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
}

