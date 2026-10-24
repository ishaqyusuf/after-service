import { cn } from "@afterservice/ui";
import { type StageKey, stageLabels } from "./landing-content";

export function StageMark({
  stage,
  className,
}: {
  stage: StageKey;
  className?: string;
}) {
  return (
    <span className={cn("wp-stage text-sm", className)} data-stage={stage}>
      <span className="wp-stage-dot" aria-hidden="true" />
      <span>{stageLabels[stage]}</span>
    </span>
  );
}
