export type BrandLogoProps = {
  name?: string;
};

export function BrandLogo({ name = "afterservice" }: BrandLogoProps) {
  return (
    <span className="as-brand-logo">
      <svg
        aria-hidden="true"
        className="as-brand-logo__mark"
        fill="none"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 51V29C50 18.5 41.5 10 31 10S12 18.5 12 29s8.5 19 19 19c5.1 0 9.8-2 13.2-5.3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="13"
        />
        <circle className="as-brand-logo__dot" cx="31" cy="29" r="6.5" />
      </svg>
      <span className="as-brand-logo__wordmark">{name}</span>
    </span>
  );
}
