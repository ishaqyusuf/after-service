import { closing } from "../landing-content";
import { StartFreeLink } from "../start-free-link";

export function ClosingSection({
  body = closing.body,
  location,
  title = closing.title,
}: {
  body?: string;
  location: string;
  title?: string;
}) {
  return (
    <section
      aria-labelledby="closing-title"
      className="wp-on-primary bg-primary py-[clamp(56px,8vw,104px)] text-primary-foreground"
    >
      <div className="wp-wrap grid justify-items-start gap-4">
        <h2
          id="closing-title"
          className="wp-display max-w-[24ch] text-[clamp(28px,3.6vw,42px)] leading-[1.12] tracking-[-0.01em]"
        >
          {title}
        </h2>
        <p className="max-w-[62ch] text-[16.5px] leading-relaxed sm:text-lg">
          {body}
        </p>
        <StartFreeLink
          location={location}
          size="lg"
          tone="inverse"
          className="max-sm:w-full"
        />
        <p className="text-sm">{closing.micro}</p>
      </div>
    </section>
  );
}
