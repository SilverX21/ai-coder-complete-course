// Small inline icon set. Stroke icons inherit currentColor; brand marks are filled.
type P = { className?: string };

function Stroke({ className = "icon", children }: P & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const Arrow = ({ className = "arrow" }: P) => (
  <Stroke className={className}>
    <path d="M6 18 18 6M8 6h10v10" strokeWidth="2" />
  </Stroke>
);

export const Mail = (p: P) => (
  <Stroke {...p}>
    <rect x="3" y="5" width="18" height="14" />
    <path d="m3 6 9 7 9-7" />
  </Stroke>
);

export const Server = (p: P) => (
  <Stroke {...p}>
    <rect x="3" y="4" width="18" height="7" />
    <rect x="3" y="13" width="18" height="7" />
    <path d="M7 7.5h.01M7 16.5h.01" strokeWidth="2.5" />
  </Stroke>
);

export const Cloud = (p: P) => (
  <Stroke {...p}>
    <path d="M17.5 19H8a6 6 0 1 1 5.7-7.9A4.5 4.5 0 1 1 17.5 19Z" />
  </Stroke>
);

export const Database = (p: P) => (
  <Stroke {...p}>
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
  </Stroke>
);

export const Layout = (p: P) => (
  <Stroke {...p}>
    <rect x="3" y="4" width="18" height="16" />
    <path d="M3 9h18M9 9v11" />
  </Stroke>
);

export const Branch = (p: P) => (
  <Stroke {...p}>
    <circle cx="6" cy="5" r="2" />
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="8" r="2" />
    <path d="M6 7v10M18 10c0 4-6 3-12 7" />
  </Stroke>
);

export const Compass = (p: P) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
  </Stroke>
);

export const Book = (p: P) => (
  <Stroke {...p}>
    <path d="M4 19V5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14" />
  </Stroke>
);

export const Globe = (p: P) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3Z" />
  </Stroke>
);

export const Pin = (p: P) => (
  <Stroke {...p}>
    <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </Stroke>
);

export const Bubble = (p: P) => (
  <Stroke {...p}>
    <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l-2 2V11.5a8.5 8.5 0 0 1 8.5-8.5h1A8.5 8.5 0 0 1 21 11.5Z" />
    <path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" strokeWidth="2.5" />
  </Stroke>
);

export const Close = (p: P) => (
  <Stroke {...p}>
    <path d="M6 6l12 12M18 6 6 18" strokeWidth="2" />
  </Stroke>
);

export const LinkedIn = ({ className = "icon" }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);

export const GitHub = ({ className = "icon" }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57l-.02-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3" />
  </svg>
);
