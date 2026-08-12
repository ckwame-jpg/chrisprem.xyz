interface IconProps {
  className?: string;
}

export function GitHubIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12a12.013 12.013 0 008.208 11.385c.6.111.82-.26.82-.577v-2.065c-3.338.726-4.043-1.61-4.043-1.61-.546-1.387-1.334-1.756-1.334-1.756-1.091-.745.083-.73.083-.73 1.205.084 1.84 1.238 1.84 1.238 1.072 1.835 2.812 1.305 3.498.998.108-.777.419-1.305.76-1.604-2.665-.304-5.466-1.333-5.466-5.933 0-1.31.469-2.381 1.235-3.22-.123-.304-.535-1.523.117-3.176 0 0 1.007-.322 3.3 1.23a11.487 11.487 0 016.003 0c2.292-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.872.12 3.176.769.839 1.233 1.91 1.233 3.22 0 4.61-2.803 5.625-5.475 5.921.43.37.813 1.103.813 2.222v3.293c0 .32.218.694.825.576A12.015 12.015 0 0024 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export function LinkedInIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM7.19 19H4.28V8.99h2.91V19zm-1.45-11.6c-.93 0-1.69-.76-1.69-1.7s.76-1.7 1.69-1.7 1.69.76 1.69 1.7-.76 1.7-1.69 1.7zM20 19h-2.91v-4.89c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.58V19h-2.91V8.99h2.79v1.37h.04c.39-.74 1.33-1.52 2.74-1.52 2.93 0 3.47 1.93 3.47 4.44V19z" />
    </svg>
  );
}

export function ExternalLinkIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 3h7v7h-2V6.414l-9.293 9.293-1.414-1.414L17.586 5H14V3z" />
      <path d="M5 5h5V3H3v7h2V5zm0 14v-5H3v7h7v-2H5z" />
    </svg>
  );
}

export function ResumeIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
