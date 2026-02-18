import React from "react";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles: Record<Variant, string> = {
    primary: "bg-black text-white hover:bg-black/90",
    secondary: "bg-black/5 text-black hover:bg-black/10",
    ghost: "bg-transparent text-black hover:bg-black/5",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
