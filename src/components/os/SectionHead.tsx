import type { ReactNode } from "react";

interface SectionHeadProps {
  num: string;
  title: string;
  meta?: ReactNode;
}

export default function SectionHead({ num, title, meta }: SectionHeadProps) {
  return (
    <div className="section-head">
      <div>
        <div className="num">{num}</div>
        <h2>{title}</h2>
      </div>
      {meta != null && <div className="meta">{meta}</div>}
    </div>
  );
}
