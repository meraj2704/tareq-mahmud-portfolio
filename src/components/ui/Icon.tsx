import type { ReactNode } from "react";

export type UiIconName = "download" | "arrowRight" | "menu" | "close";

const paths: Record<UiIconName, ReactNode> = {
  download: (
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  ),
  arrowRight: <path d="M5 12h14m-7-7 7 7-7 7" />,
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
};

interface IconProps {
  name: UiIconName;
  className?: string;
}

export function Icon({ name, className = "size-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
