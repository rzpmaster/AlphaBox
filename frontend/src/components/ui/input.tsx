import { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "h-11 w-full rounded-md border border-line bg-[#08120f] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-mint",
        className
      )}
      {...props}
    />
  );
}
