"use client";
import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import type { ImgHTMLAttributes } from "react";
export function PropertyImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSource, setFailedSource] = useState<string>();
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // A cached or fast failure can fire before React attaches onError.
    if (props.src && image.current?.complete && !image.current.naturalWidth) setFailedSource(String(props.src));
  }, [props.src]);
  if (!props.src || failedSource === props.src) return <span className={`image-fallback ${props.className || ""}`} role="img" aria-label={props.alt || "Photo unavailable"}><ImageOff aria-hidden="true" size={24}/><span>Photo unavailable</span></span>;
  return <img {...props} ref={image} onError={() => setFailedSource(String(props.src))}/>;
}
