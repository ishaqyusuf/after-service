"use client";
import type { AssistantCard } from "@afterservice/assistant";
import { Button, Input, Textarea } from "@afterservice/ui";
import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
export function AssistantResultCard({
  card,
  disabled = false,
}: {
  card: AssistantCard;
  disabled?: boolean;
}) {
  const [body, setBody] = useState(card.kind === "message" ? card.body : "");
  const [subject, setSubject] = useState(
    card.kind === "message" ? (card.subject ?? "") : "",
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>();
  if (card.kind === "proposal") return null;
  return (
    <div className="my-3 rounded-md border bg-background p-3 text-sm">
      <p className="font-medium">{card.title}</p>
      {card.kind === "records" && (
        <div className="mt-2 divide-y">
          {!card.records.length && (
            <p className="py-2 text-muted-foreground">
              No matching records. Try another name or filter.
            </p>
          )}
          {card.records.map((record) => (
            <Link
              key={record.id}
              href={record.href}
              className="block py-2 hover:underline"
            >
              <p className="font-medium">{record.label}</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-xs text-muted-foreground">
                {record.detail}
              </p>
            </Link>
          ))}
          {card.nextCursor && (
            <p className="pt-2 text-xs text-muted-foreground">
              Showing 10 records. Ask for the next page.
            </p>
          )}
        </div>
      )}
      {card.kind === "summary" && (
        <>
          <dl className="mt-3 space-y-2">
            {card.facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-start justify-between gap-4"
              >
                <dt className="text-muted-foreground">{fact.label}</dt>
                <dd className="text-right tabular-nums">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex flex-wrap gap-3">
            {card.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </>
      )}
      {card.kind === "message" && (
        <>
          {card.subject !== undefined && (
            <Input
              disabled={disabled}
              className="mt-2"
              aria-label={`${card.title} subject`}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          )}
          <Textarea
            disabled={disabled}
            aria-label={`${card.title} draft`}
            className="mt-2 min-h-28"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="mt-2 flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    [subject, body].filter(Boolean).join("\n\n"),
                  );
                  setCopied(true);
                  setError(undefined);
                } catch {
                  setError(
                    "Copy is unavailable. Select and copy the draft text.",
                  );
                }
              }}
            >
              {copied ? (
                <Check className="mr-2 size-3" />
              ) : (
                <Copy className="mr-2 size-3" />
              )}
              {copied ? "Copied" : "Copy draft"}
            </Button>
            {card.href && (
              <Link href={card.href} className="text-xs underline">
                Open follow-up to send
              </Link>
            )}
          </div>
          {error && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Draft only. No message has been sent.
          </p>
        </>
      )}
      {"asOf" in card && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          As of {new Date(card.asOf).toLocaleString()}
        </p>
      )}
    </div>
  );
}
