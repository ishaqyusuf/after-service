"use client";

import { LogEvents } from "@afterservice/events";
import { useTrack } from "@afterservice/events/client";
import type { PricingResolution } from "@afterservice/plans";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Clock3,
  FileText,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { landingFaqs } from "./faq";
import { LandingPricing } from "./pricing";

const chapters = [
  {
    label: "Keep the context",
    title: "The job is done. The details stay.",
    body: "Keep the customer, the completed work and the useful little details together. The next person to follow up starts with context.",
    proof: "Customer + job history",
    cardTitle: "A job well done.",
    cardBody: "AC maintenance complete. Filters cleaned and cooling checked.",
    state: "Recorded by Tobi",
  },
  {
    label: "Plan the check-in",
    title: "Put care on the calendar.",
    body: "Give the check-in a purpose and a due date. Start with a useful template, make it personal, then contact the customer in your usual way.",
    proof: "Templates + due dates",
    cardTitle: "A thoughtful check-in.",
    cardBody: "Hi Amara, how’s the AC working after Monday’s service?",
    state: "Draft · Ready to personalise",
  },
  {
    label: "Close the loop",
    title: "Keep the reply. Know what’s next.",
    body: "Record the contact and the response. Resolve an issue, close the follow-up or plan the next visit, with the history there when you need it.",
    proof: "Contact logs + outcomes",
    cardTitle: "Context for next time.",
    cardBody:
      "Customer says the cooling is much better. No further issue reported.",
    state: "Reply logged by Tobi",
  },
] as const;

const services = [
  {
    name: "Repair shops",
    icon: Wrench,
    title: "The fix isn’t the finish.",
    body: "Check that the repair is holding up. Keep the original job and any new issue in the same customer history.",
    prompt: "Is everything still working as it should?",
  },
  {
    name: "Installers",
    icon: FileText,
    title: "Installed. Then checked in.",
    body: "Make room for questions after handover. Plan a check-in and record what the customer tells you.",
    prompt: "Any questions now that you’ve had time to use it?",
  },
  {
    name: "Local contractors",
    icon: Check,
    title: "A good handover has a next step.",
    body: "Remember the customer after the work is complete. Keep outstanding issues visible and ask for honest feedback.",
    prompt: "How has everything settled in since we finished?",
  },
  {
    name: "Service teams",
    icon: MessageCircle,
    title: "Shared context. Personal care.",
    body: "Give the team one place to find due follow-ups, useful notes and the last customer response.",
    prompt: "Check the last contact before following up.",
  },
] as const;

function BetaLink({
  location,
  children,
  className = "care-button",
}: {
  location: string;
  children: React.ReactNode;
  className?: string;
}) {
  const track = useTrack();
  return (
    <Link
      href="/signup"
      className={className}
      onClick={() =>
        track({
          event: LogEvents.JoinFreeBeta.name,
          channel: LogEvents.JoinFreeBeta.channel,
          location,
        })
      }
    >
      {children} <ArrowUpRight size={18} aria-hidden="true" />
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="care-eyebrow">
      <span aria-hidden="true" />
      {children}
    </p>
  );
}

function HeroJourney() {
  const [stage, setStage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const scene = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(media.matches);
      if (media.matches) setStage(2);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (reduced || paused || stage >= 2) return;
    const timer = window.setInterval(() => {
      const rect = scene.current?.getBoundingClientRect();
      if (
        document.visibilityState === "visible" &&
        rect &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight
      )
        setStage((value) => Math.min(value + 1, 2));
    }, 1800);
    return () => window.clearInterval(timer);
  }, [stage, paused, reduced]);
  return (
    <div className="care-hero-scene" ref={scene} data-stage={stage}>
      <div className="care-journey-labels">
        <span>The work</span>
        <span>The follow-through</span>
        <span>The relationship</span>
      </div>
      <div className="care-journey-cards">
        <article className="care-journey-card care-receipt">
          <span className="care-mini-label">Service note · #1048</span>
          <div className="care-receipt-art">
            <Wrench size={30} />
            <span>AC</span>
          </div>
          <h3>Back to cool.</h3>
          <p>AC service. Filters cleaned, cooling checked.</p>
          <small>Completed Monday · Recorded by Tobi</small>
        </article>
        <article className="care-journey-card care-checkin">
          <span className="care-mini-label">Planned check-in</span>
          <Clock3 size={25} />
          <h3>How’s everything working?</h3>
          <p>
            A thoughtful note, ready to personalise and send in your usual
            channel.
          </p>
          <small>Due Wednesday · Manual contact</small>
        </article>
        <article className="care-journey-card care-reply">
          <span className="care-mini-label">Reply recorded</span>
          <MessageCircle size={25} />
          <h3>“Much better. Thanks for checking in!”</h3>
          <p>Amara Okeke · Illustrative response</p>
          <small>Response logged · Context kept</small>
        </article>
      </div>
      <div className="care-journey-track">
        <span style={{ width: `${(stage + 1) * 33.333}%` }} />
      </div>
      <div className="care-journey-bottom">
        <span>
          {
            [
              "The job is recorded.",
              "A check-in is planned.",
              "The reply stays with the customer.",
            ][stage]
          }
        </span>
        <div className="care-motion-actions" hidden={reduced}>
          <button
            type="button"
            onClick={() => {
              setStage(0);
              setPaused(false);
            }}
            aria-label="Replay demonstration"
          >
            <RotateCcw size={16} /> Replay
          </button>
          <button
            type="button"
            onClick={() => setPaused(!paused)}
            aria-label={paused ? "Resume demonstration" : "Pause demonstration"}
            aria-pressed={paused}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>
      <p className="care-illustrative">
        Illustrative example · Your team takes each action
      </p>
    </div>
  );
}

function Story() {
  const [active, setActive] = useState(0);
  const manualUntil = useRef(0);
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(
      "[data-care-chapter]",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        if (performance.now() < manualUntil.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setActive(
              Number((entry.target as HTMLElement).dataset.careChapter),
            );
        });
      },
      { rootMargin: "-25% 0px -35% 0px" },
    );
    targets.forEach((target) => {
      observer.observe(target);
    });
    return () => observer.disconnect();
  }, []);
  const chapter = chapters[active] ?? chapters[0];
  return (
    <section className="care-story care-wrap" id="story">
      <div className="care-section-intro">
        <Eyebrow>A small routine. A better relationship.</Eyebrow>
        <h2>
          Good service doesn’t
          <br />
          stop at the door.
        </h2>
        <p>
          Follow one customer from completed work to a thoughtful next step.
        </p>
      </div>
      <div className="care-story-grid">
        <div className="care-story-sticky">
          <div className="care-record">
            <div className="care-record-top">
              <span>afterservice / customer record</span>
              <FileText size={16} />
            </div>
            <div className="care-person">
              <span>AO</span>
              <div>
                <strong>Amara Okeke</strong>
                <small>AC maintenance · Job #1048</small>
              </div>
            </div>
            <span className="care-status">
              <Check size={14} /> {chapter.label}
            </span>
            <p className="care-mini-label">Follow-through</p>
            <h3>{chapter.cardTitle}</h3>
            <div className="care-record-note">
              <p>{chapter.cardBody}</p>
            </div>
            <div className="care-record-bottom">
              <Check size={15} /> {chapter.state}
            </div>
            <p className="care-record-footer">
              Customer context, kept together.
            </p>
          </div>
          <div className="care-story-tabs">
            {chapters.map((item, index) => (
              <button
                key={item.label}
                type="button"
                aria-label={`Chapter ${index + 1}: ${item.label}`}
                aria-pressed={active === index}
                onClick={() => {
                  manualUntil.current = performance.now() + 2000;
                  setActive(index);
                  document
                    .getElementById(`care-chapter-${index}`)
                    ?.scrollIntoView({
                      behavior: matchMedia("(prefers-reduced-motion: reduce)")
                        .matches
                        ? "instant"
                        : "smooth",
                      block: "center",
                    });
                }}
              >
                <span>0{index + 1}</span>
              </button>
            ))}
          </div>
          <small className="care-illustrative">
            Illustrative record · Your team takes each action
          </small>
        </div>
        <div className="care-story-chapters">
          {chapters.map((item, index) => (
            <article
              key={item.label}
              id={`care-chapter-${index}`}
              data-care-chapter={index}
            >
              <Eyebrow>
                0{index + 1} / {item.label}
              </Eyebrow>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
              <span className="care-proof">
                <Check size={16} /> {item.proof}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function People() {
  const [selected, setSelected] = useState(0);
  const service = services[selected] ?? services[0];
  const Icon = service.icon;
  return (
    <section className="care-people care-wrap" id="people">
      <Eyebrow>For people who take pride in their work</Eyebrow>
      <h2>
        You do the good work.
        <br />
        Keep the connection.
      </h2>
      <div className="care-people-grid">
        <div className="care-service-list">
          {services.map((item, index) => {
            const ItemIcon = item.icon;
            return (
              <button
                type="button"
                key={item.name}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                <ItemIcon size={18} />
                {item.name}
                <ArrowUpRight size={17} />
              </button>
            );
          })}
        </div>
        <div className="care-service-example">
          <Icon size={24} />
          <Eyebrow>{service.name}</Eyebrow>
          <h3>{service.title}</h3>
          <p>{service.body}</p>
          <div>
            <MessageCircle size={18} />
            <span>
              {service.prompt}
              <small>Illustrative prompt · Personalise before contacting</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CareLanding({
  initialPricing,
}: {
  initialPricing: PricingResolution;
}) {
  return (
    <main className="care-landing">
      <section className="care-hero care-wrap">
        <div className="care-hero-intro">
          <div>
            <Eyebrow>For the work after the work</Eyebrow>
            <h1>
              The job ends.
              <br />
              The care <em>carries on.</em>
            </h1>
          </div>
          <div className="care-hero-aside">
            <p>
              A check-in remembered. A reply kept in context. Give good service
              a little more follow-through.
            </p>
            <BetaLink location="landing_hero">Join the free beta</BetaLink>
            <small>Free beta · Mobile & desktop</small>
          </div>
        </div>
        <HeroJourney />
        <div className="care-hero-under">
          <span>One board for the moments after “job done”.</span>
          <a href="#story">
            Follow the story <ArrowDown size={16} />
          </a>
        </div>
      </section>
      <Story />
      <People />
      <section className="care-promise">
        <div className="care-wrap">
          <Eyebrow>Useful tools. Human follow-through.</Eyebrow>
          <h2>
            You bring the care.
            <br />
            We’ll help you keep track.
          </h2>
          <div className="care-promise-grid">
            <div>
              <Clock3 />
              <h3>A time and a purpose.</h3>
              <p>
                Give every follow-up a due date and a clear reason to reach out.
              </p>
            </div>
            <div>
              <MessageCircle />
              <h3>A useful starting point.</h3>
              <p>
                Personalise a template. Contact the customer in your usual
                channel.
              </p>
            </div>
            <div>
              <FileText />
              <h3>A record of what happened.</h3>
              <p>
                Log contact, replies and outcomes. Keep the next step visible.
              </p>
            </div>
          </div>
          <p className="care-beta-boundary">
            During beta, your team sends messages and records contact manually.
            Automated sending is planned for later.
          </p>
        </div>
      </section>
      <div className="care-pricing-section">
        <LandingPricing initialPricing={initialPricing} />
      </div>
      <section className="care-faq care-wrap" id="questions">
        <div>
          <Eyebrow>Before the next step</Eyebrow>
          <h2>
            A few things
            <br />
            worth knowing.
          </h2>
          <p>
            A practical tool.
            <br />A straightforward start.
          </p>
        </div>
        <div>
          {landingFaqs.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="care-closing care-wrap">
        <Eyebrow>The next check-in starts here</Eyebrow>
        <h2>
          Good work deserves
          <br />
          <em>a little follow-through.</em>
        </h2>
        <p>One place for the care that comes after the job.</p>
        <BetaLink location="landing_bottom">Join the free beta</BetaLink>
        <small>Free beta · Built for mobile & desktop</small>
      </section>
    </main>
  );
}
