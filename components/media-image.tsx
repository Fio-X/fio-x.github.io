import type { ComponentProps } from "react";
import { mediaDimensions } from "@/lib/media";

type MediaImageProps = Omit<ComponentProps<"img">, "src" | "width" | "height"> & { src: string };

/** Local media image with build-time width/height. The single place that renders a raw <img>. */
export function MediaImage({ src, alt = "", ...props }: MediaImageProps) {
  const size = mediaDimensions(src);
  // Static export serves /media files directly; next/image's default loader needs an image server.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} src={src} alt={alt} width={size?.width} height={size?.height} />;
}
