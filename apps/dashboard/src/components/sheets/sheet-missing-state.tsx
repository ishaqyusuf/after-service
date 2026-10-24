import { Button } from "@afterservice/ui";

type SheetMissingStateProps = {
  description: string;
  onClose: () => void;
  title: string;
};

export function SheetMissingState({
  description,
  onClose,
  title,
}: SheetMissingStateProps) {
  return (
    <div className="mt-6 flex flex-col items-start gap-4 rounded-[14px] border-[1.5px] border-dashed border-border p-6">
      <div className="space-y-1">
        <p className="text-base font-bold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-11 md:h-9"
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  );
}
