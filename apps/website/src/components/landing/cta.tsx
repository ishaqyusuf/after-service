"use client";

import { Button } from "@afterservice/ui";
import { useTrack } from "@afterservice/events/client";
import { LogEvents } from "@afterservice/events";

export function LandingCTA() {
  const track = useTrack();

  return (
    <section className="relative z-10 max-w-6xl mx-auto w-full px-6 sm:px-8 pb-32 pt-16">
      <div className="bg-gradient-to-r from-card to-card/80 border border-border rounded-3xl p-12 text-center relative overflow-hidden shadow-lg dark:shadow-2xl transition-colors duration-300">
        <div className="absolute top-[-50%] left-[-50%] w-[100%] h-[100%] rounded-full bg-primary/10 blur-[100px] pointer-events-none opacity-[0.2] dark:opacity-[1]" />

        <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight text-foreground">
          Ready to Reactivate <br className="sm:hidden" /> Your Customer Base?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-base">
          Start protecting your online reputation and driving organic referral
          and repeat jobs today. Setting up takes minutes.
        </p>
        <a 
          href="/signup" 
          className="inline-block"
          onClick={() => track({ event: LogEvents.CTA.name, channel: LogEvents.CTA.channel, location: "landing_bottom" })}
        >
          <Button
            size="lg"
            className="h-14 px-8 text-base font-bold shadow-lg shadow-[#009b98]/20"
          >
            Start Your 14-Day Free Trial
          </Button>
        </a>
      </div>
    </section>
  );
}
