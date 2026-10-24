import { Button } from "@afterservice/ui";
import { hero } from "../landing-content";
import { RecordDemo } from "../record-demo";
import { StartFreeLink } from "../start-free-link";

export function HeroSection() {
  return (
    <section
      aria-label="Introduction"
      className="border-b border-border bg-secondary py-[clamp(48px,7vw,96px)]"
    >
      <div className="wp-wrap grid items-center gap-[clamp(32px,5vw,72px)] min-[901px]:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="grid justify-items-start gap-[22px]">
          <h1 className="wp-display max-w-[12ch] text-[clamp(40px,5.6vw,70px)] leading-[1.02] tracking-[-0.02em]">
            {hero.title}
          </h1>
          <p className="max-w-[58ch] text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]">
            {hero.body}
          </p>
          <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2.5">
            <StartFreeLink
              location="landing_hero"
              size="lg"
              className="max-sm:flex-[1_1_100%]"
            />
            <Button
              asChild
              variant="outline"
              className="h-[50px] rounded-[10px] border-input bg-card px-[22px] text-base font-semibold text-foreground max-sm:flex-[1_1_100%]"
            >
              <a href="#story">See how it works</a>
            </Button>
          </div>
          <p className="wp-tertiary text-sm">{hero.micro}</p>
        </div>
        <RecordDemo />
      </div>
    </section>
  );
}
