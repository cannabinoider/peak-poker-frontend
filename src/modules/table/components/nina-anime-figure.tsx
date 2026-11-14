import Image from "next/image";
import type { CSSProperties } from "react";

import type { DealMode } from "@/modules/table/components/card-deal";

import s from "./dealer-figure.module.css";

type NinaAnimeFigureProps = {
  className: string;
  style: CSSProperties;
  label: string;
  mode: DealMode;
};

const POSES: Record<DealMode, { src: string; width: number }> = {
  idle: { src: "/nina-anime-dealer.webp", width: 764 },
  shuffle: { src: "/nina-shuffle-pose.webp", width: 638 },
  deal: { src: "/nina-deal-pose.webp", width: 743 },
};

/** Nina has distinct rigged poses; the heart appears only after a win. */
export const NinaAnimeFigure = ({
  className,
  style,
  label,
  mode,
}: NinaAnimeFigureProps) => (
  <div className={`${className} ${s.nina}`} style={style} role="img" aria-label={label}>
    <Image
      key={POSES[mode].src}
      src={POSES[mode].src}
      alt=""
      width={POSES[mode].width}
      height={1024}
      priority
      draggable={false}
      className={s.ninaImage}
    />
    {mode === "idle" && <span className={s.ninaBlink} aria-hidden />}
    {mode === "shuffle" && (
      <span className={s.ninaRiffle} aria-hidden>
        <i />
        <i />
        <i />
      </span>
    )}
    <span className={s.kiss} aria-hidden>
      ♥
    </span>
  </div>
);
