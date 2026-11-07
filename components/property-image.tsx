"use client";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { ImgHTMLAttributes } from "react";
export function PropertyImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSource, setFailedSource] = useState<string>();
  if (!props.src || failedSource === props.src) return <span className={`image-fallback ${props.className || ""}`} role="img" aria-label={props.alt || "Photo unavailable"}><ImageOff aria-hidden="true" size={24}/><span>Photo unavailable</span></span>;
  return <img {...props} onError={() => setFailedSource(String(props.src))}/>;
}
