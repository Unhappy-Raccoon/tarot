import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function CelestialBrandMark(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M15.5 3.2A8.8 8.8 0 1 0 20.8 17 8.1 8.1 0 0 1 15.5 3.2Z"/>
      <path d="m17.7 3 .8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8z"/>
      <path d="M5 5.4v2.2M3.9 6.5h2.2"/>
    </IconBase>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m2.8 10.4 9.2-7.2 9.2 7.2v10.2h-6v-6.2h-6v6.2h-6z"/>
      <path d="M10.2 20.6v-6.2h3.6v6.2"/>
    </IconBase>
  );
}

export function TarotIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.7" y="4.1" width="11.7" height="16" rx="1.6" transform="rotate(-8 9.5 12.1)"/>
      <rect x="8.7" y="3.8" width="11.7" height="16" rx="1.6" transform="rotate(8 14.5 11.8)"/>
      <path d="m14.1 8.2 1.1 2.2 2.2 1.1-2.2 1.1-1.1 2.2-1.1-2.2-2.2-1.1 2.2-1.1z"/>
    </IconBase>
  );
}

export function JournalIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 5.1c3.1-.9 5.9-.7 8.5.8v14c-2.6-1.5-5.4-1.7-8.5-.8z"/>
      <path d="M20.5 5.1c-3.1-.9-5.9-.7-8.5.8v14c2.6-1.5 5.4-1.7 8.5-.8z"/>
      <path d="M6.5 8.2h2.7m-2.7 3.1h2.7m6.8-3.1h2.7m-2.7 3.1h2.7"/>
    </IconBase>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="3.25"/>
      <path d="M4.8 20c.5-3.6 3-5.6 7.2-5.6s6.7 2 7.2 5.6"/>
      <circle cx="12" cy="12" r="10"/>
    </IconBase>
  );
}

export function AstrologyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="2.4"/>
      <ellipse cx="12" cy="12" rx="9.2" ry="4.3" transform="rotate(-34 12 12)"/>
      <ellipse cx="12" cy="12" rx="9.2" ry="4.3" transform="rotate(34 12 12)"/>
      <path d="M12 1.8v2.4m0 15.6v2.4"/>
      <circle cx="18.8" cy="7.1" r="1.1"/>
    </IconBase>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3.1"/>
      <path d="M12 2.5v2m0 15v2M2.5 12h2m15 0h2M5.3 5.3l1.4 1.4m10.6 10.6 1.4 1.4m0-13.4-1.4 1.4M6.7 17.3l-1.4 1.4"/>
      <path d="m8.2 4.4 1-.9h5.6l1 1 2.1.8 1.3-.2 2.8 4.8-.7 1.2v1.8l.7 1.2-2.8 4.8-1.3-.2-2.1.8-1 1H9.2l-1-.9-2.1-.8-1.3.2L2 14.2l.7-1.2v-1.8L2 10l2.8-4.8 1.3.2z"/>
    </IconBase>
  );
}

export function DailyMoonIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M15.5 3.2A8.8 8.8 0 1 0 20.8 17 8.1 8.1 0 0 1 15.5 3.2Z"/>
      <path d="m18.6 3.8.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>
    </IconBase>
  );
}
