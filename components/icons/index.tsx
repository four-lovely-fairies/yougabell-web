import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
    ...rest,
  };
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M15 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClearCircleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path
        d="M9 9l6 6M15 9l-6 6"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M4 20h4l10.5-10.5a2.121 2.121 0 10-3-3L5 17v3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M16.365 12.93c-.025-2.582 2.106-3.82 2.203-3.88-1.2-1.755-3.067-1.995-3.728-2.022-1.588-.16-3.098.935-3.904.935-.811 0-2.054-.911-3.376-.886-1.737.025-3.34 1.01-4.234 2.566-1.806 3.13-.462 7.764 1.298 10.31.86 1.248 1.886 2.65 3.231 2.6 1.297-.052 1.787-.84 3.354-.84 1.563 0 2.005.84 3.377.815 1.395-.025 2.279-1.27 3.13-2.525.987-1.447 1.394-2.85 1.418-2.92-.031-.013-2.722-1.045-2.769-4.153zM13.882 5.39c.715-.866 1.198-2.07 1.066-3.27-1.029.043-2.278.687-3.018 1.55-.663.766-1.241 1.99-1.085 3.166 1.148.09 2.32-.582 3.037-1.446z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SunriseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="14" r="4" fill="#FFB85C" />
      <path
        d="M2 20h20M12 4v3M5.5 7.5l2 2M18.5 7.5l-2 2"
        stroke="#F39A2B"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" fill="#FFC857" />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"
        stroke="#F39A2B"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M20 14.5A8 8 0 019.5 4a1 1 0 00-1.3-1.2A9 9 0 1021.2 15.8a1 1 0 00-1.2-1.3z"
        fill="#9080FF"
      />
    </svg>
  );
}

export function StarsNightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#3E3A6B" />
      <circle cx="8" cy="9" r="0.8" fill="#fff" />
      <circle cx="13" cy="7" r="0.6" fill="#fff" />
      <circle cx="16" cy="12" r="0.7" fill="#fff" />
      <circle cx="10" cy="15" r="0.5" fill="#fff" />
      <path
        d="M6 18l3-2 3 1 4-3 2 2"
        stroke="#9080FF"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}

export function FaceIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" fill="#F8D2C3" />
      <circle cx="9" cy="11" r="0.9" fill="#262626" />
      <circle cx="15" cy="11" r="0.9" fill="#262626" />
      <path
        d="M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5"
        stroke="#262626"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
