"use client";

import { Card } from "@/components/ui/wearify-ui";

export default function PlaceholderPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: string[];
}) {
  return (
    <div>
      <h1 className="text-base font-extrabold text-wf-text mb-1">{title}</h1>
      <p className="text-[10px] text-wf-subtext mb-3">{description}</p>
      <Card>
        <div className="text-center py-6">
          <div className="text-2xl mb-2">🚧</div>
          <div className="text-[11px] text-wf-text font-semibold mb-2">
            Phase 1c — Coming Next
          </div>
          <div className="text-[9px] text-wf-muted max-w-md mx-auto mb-3">
            Planned sections for this module:
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            {sections.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 bg-wf-card border border-wf-border rounded text-[8px] text-wf-subtext"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
