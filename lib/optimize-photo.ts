// Runs in the admin's browser, before transfer/storage. Dimensions are retained.
// Encoder quality is not a percentage of visual fidelity: measure each result.
export async function optimizePhoto(file: File): Promise<File> {
  const original = await createImageBitmap(file).catch(() => { throw new Error("This photo could not be read. Choose a different image."); });
  try {
    if (original.width * original.height > 40_000_000) throw new Error("Choose a photo with fewer than 40 million pixels.");
    const canvas = document.createElement("canvas");
    canvas.width = original.width; canvas.height = original.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Photo conversion is unavailable in this browser. Try an updated browser.");
    ctx.drawImage(original, 0, 0);
    const sample = document.createElement("canvas");
    const scale = Math.min(1, 1600 / Math.max(original.width, original.height));
    sample.width = Math.max(1, Math.round(original.width * scale)); sample.height = Math.max(1, Math.round(original.height * scale));
    const comparison = sample.getContext("2d", { willReadFrequently: true })!;
    comparison.drawImage(original, 0, 0, sample.width, sample.height);
    const reference = comparison.getImageData(0, 0, sample.width, sample.height).data;
    let best: Blob | undefined;
    for (const quality of [.85, .90, .93, .95, .96, .97, .98, .99, 1]) {
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Photo conversion failed. Please try again.")), "image/webp", quality));
      if (blob.type !== "image/webp") throw new Error("This browser cannot create WebP photos. Try an updated browser.");
      const decoded = await createImageBitmap(blob);
      try {
        comparison.clearRect(0, 0, sample.width, sample.height);
        comparison.drawImage(decoded, 0, 0, sample.width, sample.height);
        if (visuallyClose(reference, comparison.getImageData(0, 0, sample.width, sample.height).data, sample.width, sample.height)) {
          if (!best || blob.size < best.size) best = blob;
          break;
        }
      } finally { decoded.close(); }
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    if (!best) throw new Error("This photo could not be compressed without a noticeable change. Please use a different photo or add its image URL.");
    if (file.type === "image/webp" && best.size >= file.size) return file;
    if (best.size > 8 * 1024 * 1024) throw new Error("The converted photo is larger than 8 MB. Choose a smaller photo.");
    return new File([best], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } finally { original.close(); }
}

function visuallyClose(a: Uint8ClampedArray, b: Uint8ClampedArray, width: number, height: number) {
  let score = 0, blocks = 0, squaredError = 0, count = 0, weak = 0;
  // Local RGB SSIM protects texture/edges and colour; an additional error bound
  // prevents a high average score from hiding a visibly different small area.
  for (let y = 0; y < height; y += 8) for (let x = 0; x < width; x += 8) for (let channel = 0; channel < 3; channel++) {
    let sa = 0, sb = 0, aa = 0, bb = 0, ab = 0, n = 0;
    for (let dy = y; dy < Math.min(y + 8, height); dy++) for (let dx = x; dx < Math.min(x + 8, width); dx++) {
      const i = (dy * width + dx) * 4;
      // Composite against white for stable transparent-pixel comparisons.
      const av = a[i + channel] * a[i + 3] / 255 + 255 - a[i + 3];
      const bv = b[i + channel] * b[i + 3] / 255 + 255 - b[i + 3];
      sa += av; sb += bv; aa += av * av; bb += bv * bv; ab += av * bv; n++;
      squaredError += (av - bv) ** 2; count++;
    }
    const ma = sa / n, mb = sb / n;
    const ssim = ((2 * ma * mb + 6.5025) * (2 * (ab / n - ma * mb) + 58.5225)) / ((ma * ma + mb * mb + 6.5025) * (Math.max(0, aa / n - ma * ma) + Math.max(0, bb / n - mb * mb) + 58.5225));
    if (ssim < .85) weak++;
    score += ssim; blocks++;
  }
  return score / blocks >= .98 && weak / blocks <= .01 && squaredError / count <= 16.33; // PSNR >= 36 dB
}
