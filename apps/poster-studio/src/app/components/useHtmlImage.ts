import { useEffect, useState } from "react";

export function useHtmlImage(src?: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    const onLoad = () => setImage(img);
    const onError = () => setImage(null);

    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);

    return () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
    };
  }, [src]);

  return src ? image : null;
}

