import { ChevronDown } from 'lucide-react';

/** Native <details> with consistent styling; works without JavaScript and with keyboards. */
export default function Disclosure({ summary, children, defaultOpen = false, className = '' }) {
  return (
    <details open={defaultOpen} className={`group ${className}`}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover [&::-webkit-details-marker]:hidden">
        <ChevronDown className="h-4 w-4 transition-transform duration-150 group-open:rotate-180" aria-hidden="true" />
        {summary}
      </summary>
      <div className="pt-2">{children}</div>
    </details>
  );
}
