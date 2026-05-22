import { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-mint text-ink hover:bg-[#8affcc]",
        variant === "ghost" && "border border-line bg-panel/70 text-slate-100 hover:border-mint/50",
        variant === "danger" && "bg-redsignal text-white hover:bg-redsignal/80",
        className
      )}
      {...props}
    />
  );
}
