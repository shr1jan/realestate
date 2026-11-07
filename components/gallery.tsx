"use client";
import { useRef, useState } from "react";
import { X, ArrowLeft, ArrowRight, Grid2X2 } from "lucide-react";
import { PropertyImage } from "./property-image";
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index,setIndex] = useState(0); const dialog = useRef<HTMLDialogElement>(null);
  const move = (delta: number) => setIndex(i => (i + delta + images.length) % images.length);
  const open = (i: number) => { setIndex(i); dialog.current?.showModal(); };
  return <><div className={`gallery ${images.length < 3 ? "gallery-single" : ""}`}>
    <button className="gallery-main" onClick={() => open(0)} aria-label={`View ${title} photo gallery`}><PropertyImage src={images[0]} alt={`${title}, main property photo`}/></button>
    {images.length >= 3 && <div className="gallery-side">{images.slice(1,3).map((src,i) => <button key={`${src}-${i}`} onClick={() => open(i+1)} aria-label={`View photo ${i+2}`}><PropertyImage src={src} alt={`${title}, property photo ${i+2}`}/></button>)}</div>}
    <button className="gallery-show" onClick={() => open(0)}><Grid2X2 size={16}/>View all {images.length} photos</button>
  </div><dialog ref={dialog} className="gallery-dialog" aria-label={`${title} photo gallery`} onKeyDown={e => { if(e.key === "ArrowRight"){e.preventDefault();move(1);} if(e.key === "ArrowLeft"){e.preventDefault();move(-1);} }}><div className="gallery-dialog-top"><span>{title} <span className="muted">{index+1} / {images.length}</span></span><button className="icon-button" onClick={() => dialog.current?.close()} aria-label="Close gallery"><X/></button></div><div className="gallery-stage"><button className="icon-button" onClick={() => move(-1)} aria-label="Previous photo"><ArrowLeft/></button><PropertyImage src={images[index]} alt={`${title}, photo ${index+1}`}/><button className="icon-button" onClick={() => move(1)} aria-label="Next photo"><ArrowRight/></button></div><div className="gallery-thumbnails">{images.map((src,i) => <button key={`${src}-${i}`} className={index === i ? "selected" : ""} onClick={() => setIndex(i)} aria-label={`Show photo ${i+1}`} aria-pressed={index === i}><PropertyImage src={src} alt=""/></button>)}</div></dialog></>;
}
