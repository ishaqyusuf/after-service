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
    <div className="mt-6 border border-border p-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  );
}
