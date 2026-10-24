export function OnboardingHelp() {
  return (
    <details className="rounded-md border px-4 py-3 text-sm">
      <summary className="cursor-pointer font-medium">
        Help setting up your workspace
      </summary>
      <dl className="mt-4 space-y-3 text-muted-foreground">
        <div>
          <dt className="font-medium text-foreground">Business name</dt>
          <dd>
            Use the name your customers recognize. This appears in your
            workspace and message templates.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">
            Business type and service category
          </dt>
          <dd>
            Choose the closest suggestion, or enter your own. You can change
            these in Settings.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Follow-up delay</dt>
          <dd>
            Start with seven days if you do not have a preferred cadence. This
            creates a reminder to work on the board; it does not send a message
            automatically.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">What happens next?</dt>
          <dd>
            Add a customer, record a completed job, and schedule a follow-up.
            The dashboard assistant can help prepare these records after your
            workspace is created.
          </dd>
        </div>
      </dl>
    </details>
  );
}
