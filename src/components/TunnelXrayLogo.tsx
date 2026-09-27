import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function TunnelXrayLogo({ size = 16, className = '', ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="miter"
      strokeMiterlimit="4"
      className={className}
      aria-label="TunnelXray Logo"
      {...props}
    >
      {/* Equilateral Triangle */}
      <polygon points="12,3.68 22,21 2,21" />
      {/* Inscribed Circle */}
      <circle cx="12" cy="15.23" r="5.77" />
      {/* Vertical Altitude Line */}
      <line x1="12" y1="3.68" x2="12" y2="21" strokeLinecap="butt" />
    </svg>
  );
}

export default TunnelXrayLogo;
