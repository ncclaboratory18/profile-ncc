import Image from "next/image";
import { NCC_MARK } from "@/lib/gallery";

const RATIO = 3840 / 2588; // native aspect of the NC mark

/** The NC mark, sized by height. Transparent PNG — sits on any dark surface. */
export function NccMark({
  height = 32,
  className,
  priority,
}: {
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={NCC_MARK}
      alt="NCC Lab"
      width={Math.round(height * RATIO)}
      height={height}
      priority={priority}
      className={className}
      // No inline width/height override: the props above already encode the
      // native ratio, so pinning one dimension in CSS while the other comes
      // from the attribute is what trips Next's aspect-ratio warning.
    />
  );
}
