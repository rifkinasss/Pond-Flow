"use client";

type LandingScrollButtonProps = {
  target: string;
  children: React.ReactNode;
  className?: string;
};

export function LandingScrollButton({ target, children, className }: LandingScrollButtonProps) {
  const scrollToSection = () => {
    document.querySelector(`[data-section="${target}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <button type="button" onClick={scrollToSection} className={className}>
      {children}
    </button>
  );
}
