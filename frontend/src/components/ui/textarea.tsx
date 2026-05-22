import { TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "min-h-36 w-full rounded-md border border-line bg-[#08120f] px-3 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-mint",
        className
      )}
      {...props}
    />
  );
}
