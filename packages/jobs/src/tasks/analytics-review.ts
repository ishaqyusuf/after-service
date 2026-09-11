import { getDbClient } from "@afterservice/db";
import { createAdminClient } from "@ishaqyusuf/logly-server";
import { logger, schedules } from "@trigger.dev/sdk/v3";

const TASK_ID = "daily-analytics-review" as const;
const LAGOS_UTC_OFFSET = "+01:00";

type EmailEnv = {
  emailFrom: string;
  resendApiKey: string;
  testEmail: string;
};

type LoglyEnv = {
  collectorUrl: string;
  project: string;
  readKey: string;
};

type AnalyticsReviewEnv = {
  email: EmailEnv | null;
  missingEmailKeys: string[];
  logly: LoglyEnv | null;
  missingLoglyKeys: string[];
};

type ReportWindow = {
  end: Date;
  endDate: string;
  previousEnd: Date;
  previousStart: Date;
  reportDate: string;
  start: Date;
  startDate: string;
};

type AnalyticsSection = {
  error?: string;
  rows: AnalyticsRow[];
};

type AnalyticsRow = {
  label: string;
  value: string;
};

type AnalyticsReport = {
  events: AnalyticsSection;
  metrics: AnalyticsSection;
  referrers: AnalyticsSection;
  routes: AnalyticsSection;
};

type LoglyEvent = {
  name: string;
  occurredAt: string;
  referrerHost: string | null;
  route: string | null;
  visitKind: "new" | "returning" | null;
  visitorKey: string | null;
};

type DatabaseReport = {
  daily: {
    customers: number;
    followUps: number;
    jobs: number;
    messageLogs: number;
    templates: number;
    users: number;
    workspaces: number;
  };
  followUpsByStatus: Array<{ count: number; status: string }>;
  totals: {
    customers: number;
    followUps: number;
    jobs: number;
    messageLogs: number;
    templates: number;
    users: number;
    workspaces: number;
  };
  topWorkspaces: Array<{
    activity: number;
    customers: number;
    followUps: number;
    jobs: number;
    messageLogs: number;
    name: string;
    slug: string;
  }>;
  workspacesByStatus: Array<{ count: number; status: string }>;
};

type WorkspaceActivity = {
  customers: number;
  followUps: number;
  jobs: number;
  messageLogs: number;
};

function readEnvGroup<const Key extends string>(
  keys: readonly Key[],
): { missing: Key[]; values: Partial<Record<Key, string>> } {
  const values = Object.fromEntries(
    keys.flatMap((key) => {
      const value = process.env[key]?.trim();
      return value ? [[key, value]] : [];
    }),
  ) as Partial<Record<Key, string>>;
  const missing = keys.filter((key) => !values[key]);

  return { missing, values };
}

function requiredEnvValue<const Key extends string>(
  values: Partial<Record<Key, string>>,
  key: Key,
) {
  const value = values[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

function readAnalyticsReviewEnv(): AnalyticsReviewEnv {
  const emailKeys = [
    "EMAIL_FROM_ADDRESS",
    "RESEND_API_KEY",
    "TEST_EMAIL",
  ] as const;
  const loglyKeys = ["LOGLY_COLLECTOR_URL", "LOGLY_READ_KEY"] as const;
  const email = readEnvGroup(emailKeys);
  const logly = readEnvGroup(loglyKeys);

  return {
    email:
      email.missing.length === 0
        ? {
            emailFrom: requiredEnvValue(email.values, "EMAIL_FROM_ADDRESS"),
            resendApiKey: requiredEnvValue(email.values, "RESEND_API_KEY"),
            testEmail: requiredEnvValue(email.values, "TEST_EMAIL"),
          }
        : null,
    missingEmailKeys: email.missing,
    logly:
      logly.missing.length === 0
        ? {
            collectorUrl: requiredEnvValue(logly.values, "LOGLY_COLLECTOR_URL"),
            project: process.env.LOGLY_PROJECT?.trim() || "afterservice",
            readKey: requiredEnvValue(logly.values, "LOGLY_READ_KEY"),
          }
        : null,
    missingLoglyKeys: logly.missing,
  };
}

function missingReason(keys: string[]) {
  return `Missing required env vars: ${keys.join(", ")}`;
}

function unavailableAnalyticsReport(reason: string): AnalyticsReport {
  const section = { error: reason, rows: [] };

  return {
    events: section,
    metrics: section,
    referrers: section,
    routes: section,
  };
}

function compactSummary(rows: Array<{ label: string; value: number }>) {
  return Object.fromEntries(rows.map((row) => [row.label, row.value]));
}

function summarizeDatabaseReport(database: DatabaseReport) {
  return {
    daily: compactSummary([
      { label: "jobs", value: database.daily.jobs },
      { label: "customers", value: database.daily.customers },
      { label: "templates", value: database.daily.templates },
      { label: "followUps", value: database.daily.followUps },
      { label: "messageLogs", value: database.daily.messageLogs },
      { label: "users", value: database.daily.users },
      { label: "workspaces", value: database.daily.workspaces },
    ]),
    topWorkspaces: database.topWorkspaces.map((workspace) => ({
      activity: workspace.activity,
      slug: workspace.slug,
    })),
    totals: compactSummary([
      { label: "jobs", value: database.totals.jobs },
      { label: "customers", value: database.totals.customers },
      { label: "templates", value: database.totals.templates },
      { label: "followUps", value: database.totals.followUps },
      { label: "messageLogs", value: database.totals.messageLogs },
      { label: "users", value: database.totals.users },
      { label: "workspaces", value: database.totals.workspaces },
    ]),
  };
}

function lagosDateString(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Africa/Lagos",
    year: "numeric",
  }).format(date);
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00${LAGOS_UTC_OFFSET}`);
  date.setUTCDate(date.getUTCDate() + days);
  return lagosDateString(date);
}

function startOfLagosDate(dateString: string) {
  return new Date(`${dateString}T00:00:00${LAGOS_UTC_OFFSET}`);
}

function getReportWindow(now = new Date()): ReportWindow {
  const today = lagosDateString(now);
  const reportDate = addDays(today, -1);
  const previousDate = addDays(reportDate, -1);
  const nextDate = addDays(reportDate, 1);

  return {
    end: startOfLagosDate(nextDate),
    endDate: nextDate,
    previousEnd: startOfLagosDate(reportDate),
    previousStart: startOfLagosDate(previousDate),
    reportDate,
    start: startOfLagosDate(reportDate),
    startDate: reportDate,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function countRows(values: Array<string | null>): AnalyticsRow[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value: formatNumber(value) }));
}

async function getAnalyticsReport(
  env: LoglyEnv | null,
  window: ReportWindow,
  unavailableReason?: string,
): Promise<AnalyticsReport> {
  if (!env) {
    return unavailableAnalyticsReport(
      unavailableReason ?? "Logly env is not configured.",
    );
  }

  try {
    const client = createAdminClient({
      collectorUrl: env.collectorUrl,
      readKey: env.readKey,
    });
    const response = await client.read<{ data: LoglyEvent[] }>(
      `/v1/dashboard/events?project=${encodeURIComponent(env.project)}`,
    );
    const events = response.data.filter((event) => {
      const occurredAt = new Date(event.occurredAt);
      return occurredAt >= window.start && occurredAt < window.end;
    });
    const visitors = new Set(
      events.flatMap((event) => (event.visitorKey ? [event.visitorKey] : [])),
    );
    const newVisitors = events.filter(
      (event) => event.name === "site_visit" && event.visitKind === "new",
    ).length;
    const returningVisitors = events.filter(
      (event) => event.name === "site_visit" && event.visitKind === "returning",
    ).length;

    return {
      events: { rows: countRows(events.map((event) => event.name)) },
      metrics: {
        rows: [
          { label: "Visitors", value: formatNumber(visitors.size) },
          { label: "New visitors", value: formatNumber(newVisitors) },
          {
            label: "Returning visitors",
            value: formatNumber(returningVisitors),
          },
          { label: "Events", value: formatNumber(events.length) },
        ],
      },
      referrers: {
        rows: countRows(events.map((event) => event.referrerHost)),
      },
      routes: { rows: countRows(events.map((event) => event.route)) },
    };
  } catch (error) {
    return unavailableAnalyticsReport(
      error instanceof Error ? error.message : String(error),
    );
  }
}

function addActivity(
  activity: Map<string, WorkspaceActivity>,
  workspaceId: string,
  key: keyof WorkspaceActivity,
  count: number,
) {
  const current = activity.get(workspaceId) ?? {
    customers: 0,
    followUps: 0,
    jobs: 0,
    messageLogs: 0,
  };

  current[key] += count;
  activity.set(workspaceId, current);
}

async function getDatabaseReport(
  window: ReportWindow,
): Promise<DatabaseReport> {
  const db = getDbClient();
  const dateWhere = {
    createdAt: {
      gte: window.start,
      lt: window.end,
    },
  };

  const [
    dailyJobs,
    dailyCustomers,
    dailyTemplates,
    dailyFollowUps,
    dailyMessageLogs,
    dailyUsers,
    dailyWorkspaces,
    totalJobs,
    totalCustomers,
    totalTemplates,
    totalFollowUps,
    totalMessageLogs,
    totalUsers,
    totalWorkspaces,
    followUpsByStatus,
    workspacesByStatus,
    jobActivity,
    customerActivity,
    followUpActivity,
    messageLogActivity,
  ] = await Promise.all([
    db.serviceJob.count({ where: dateWhere }),
    db.customer.count({ where: dateWhere }),
    db.followUpTemplate.count({ where: dateWhere }),
    db.followUp.count({ where: dateWhere }),
    db.messageLog.count({ where: dateWhere }),
    db.user.count({ where: dateWhere }),
    db.workspace.count({ where: dateWhere }),
    db.serviceJob.count(),
    db.customer.count(),
    db.followUpTemplate.count(),
    db.followUp.count(),
    db.messageLog.count(),
    db.user.count(),
    db.workspace.count(),
    db.followUp.groupBy({
      _count: { _all: true },
      by: ["status"],
    }),
    db.workspace.groupBy({
      _count: { _all: true },
      by: ["planStatus"],
    }),
    db.serviceJob.groupBy({
      _count: { _all: true },
      by: ["workspaceId"],
      where: dateWhere,
    }),
    db.customer.groupBy({
      _count: { _all: true },
      by: ["workspaceId"],
      where: dateWhere,
    }),
    db.followUp.groupBy({
      _count: { _all: true },
      by: ["workspaceId"],
      where: dateWhere,
    }),
    db.messageLog.groupBy({
      _count: { _all: true },
      by: ["workspaceId"],
      where: dateWhere,
    }),
  ]);

  const activity = new Map<string, WorkspaceActivity>();

  for (const row of jobActivity) {
    addActivity(activity, row.workspaceId, "jobs", row._count._all);
  }

  for (const row of customerActivity) {
    addActivity(activity, row.workspaceId, "customers", row._count._all);
  }

  for (const row of followUpActivity) {
    addActivity(activity, row.workspaceId, "followUps", row._count._all);
  }

  for (const row of messageLogActivity) {
    addActivity(activity, row.workspaceId, "messageLogs", row._count._all);
  }

  const workspaceIds = [...activity.entries()]
    .map(([workspaceId, values]) => ({
      activity:
        values.jobs + values.customers + values.followUps + values.messageLogs,
      workspaceId,
    }))
    .sort((a, b) => b.activity - a.activity)
    .slice(0, 5)
    .map((item) => item.workspaceId);
  const workspaces =
    workspaceIds.length > 0
      ? await db.workspace.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
          },
          where: {
            id: { in: workspaceIds },
          },
        })
      : [];
  const workspaceById = new Map(
    workspaces.map((workspace) => [workspace.id, workspace]),
  );
  const topWorkspaces = workspaceIds
    .map((workspaceId) => {
      const counts = activity.get(workspaceId);
      const workspace = workspaceById.get(workspaceId);

      if (!counts || !workspace) {
        return undefined;
      }

      return {
        activity:
          counts.jobs +
          counts.customers +
          counts.followUps +
          counts.messageLogs,
        customers: counts.customers,
        followUps: counts.followUps,
        jobs: counts.jobs,
        messageLogs: counts.messageLogs,
        name: workspace.name,
        slug: workspace.slug,
      };
    })
    .filter((workspace): workspace is DatabaseReport["topWorkspaces"][number] =>
      Boolean(workspace),
    );

  return {
    daily: {
      customers: dailyCustomers,
      followUps: dailyFollowUps,
      jobs: dailyJobs,
      messageLogs: dailyMessageLogs,
      templates: dailyTemplates,
      users: dailyUsers,
      workspaces: dailyWorkspaces,
    },
    followUpsByStatus: followUpsByStatus.map((row) => ({
      count: row._count._all,
      status: row.status,
    })),
    totals: {
      customers: totalCustomers,
      followUps: totalFollowUps,
      jobs: totalJobs,
      messageLogs: totalMessageLogs,
      templates: totalTemplates,
      users: totalUsers,
      workspaces: totalWorkspaces,
    },
    topWorkspaces,
    workspacesByStatus: workspacesByStatus.map((row) => ({
      count: row._count._all,
      status: row.planStatus,
    })),
  };
}

function renderKeyValueGrid(rows: AnalyticsRow[]) {
  if (rows.length === 0) {
    return '<p style="margin:0;color:#667085;">Unavailable.</p>';
  }

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${rows
    .map(
      (row) => `<tr>
        <td style="padding:6px 0;color:#475467;">${escapeHtml(row.label)}</td>
        <td align="right" style="padding:6px 0;font-weight:600;color:#101828;">${escapeHtml(row.value)}</td>
      </tr>`,
    )
    .join("")}</table>`;
}

function renderSection(title: string, section: AnalyticsSection) {
  const note = section.error
    ? `<p style="margin:8px 0 0;color:#667085;font-size:12px;">${escapeHtml(section.error)}</p>`
    : "";

  return `<section style="padding:16px;border:1px solid #eaecf0;border-radius:8px;">
    <h2 style="margin:0 0 10px;font-size:16px;color:#101828;">${escapeHtml(title)}</h2>
    ${renderKeyValueGrid(section.rows)}
    ${note}
  </section>`;
}

function renderMetricCards(items: Array<{ label: string; value: number }>) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${items
    .map(
      (item) => `<tr>
        <td style="padding:6px 0;color:#475467;">${escapeHtml(item.label)}</td>
        <td align="right" style="padding:6px 0;font-weight:600;color:#101828;">${formatNumber(item.value)}</td>
      </tr>`,
    )
    .join("")}</table>`;
}

function renderStatusRows(rows: Array<{ count: number; status: string }>) {
  return rows.length > 0
    ? renderMetricCards(
        rows.map((row) => ({
          label: row.status.replaceAll("_", " "),
          value: row.count,
        })),
      )
    : '<p style="margin:0;color:#667085;">None.</p>';
}

function renderNoticeList(items: string[]) {
  if (items.length === 0) {
    return "";
  }

  return `<section style="margin-bottom:16px;padding:16px;border:1px solid #fecdca;border-radius:8px;background:#fffbfa;">
    <h2 style="margin:0 0 10px;font-size:16px;color:#912018;">Unavailable report sections</h2>
    <ul style="margin:0;padding-left:20px;color:#667085;">${items
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("")}</ul>
  </section>`;
}

function renderTopWorkspaces(workspaces: DatabaseReport["topWorkspaces"]) {
  if (workspaces.length === 0) {
    return '<p style="margin:0;color:#667085;">No workspace activity for this review window.</p>';
  }

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${workspaces
    .map(
      (workspace) => `<tr>
        <td style="padding:8px 0;color:#101828;">
          <strong>${escapeHtml(workspace.name)}</strong>
          <span style="color:#667085;">/${escapeHtml(workspace.slug)}</span>
          <div style="color:#667085;font-size:12px;">${formatNumber(
            workspace.jobs,
          )} jobs, ${formatNumber(workspace.customers)} customers, ${formatNumber(
            workspace.followUps,
          )} follow-ups, ${formatNumber(workspace.messageLogs)} messages</div>
        </td>
        <td align="right" style="padding:8px 0;font-weight:600;color:#101828;">${formatNumber(workspace.activity)}</td>
      </tr>`,
    )
    .join("")}</table>`;
}

function renderEmail(
  window: ReportWindow,
  analytics: AnalyticsReport,
  database: DatabaseReport,
  unavailableNotes: string[],
) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;color:#101828;">
    <main style="max-width:720px;margin:0 auto;padding:24px;">
      <p style="margin:0 0 6px;color:#667085;">afterservice daily analytics review</p>
      <h1 style="margin:0 0 4px;font-size:24px;color:#101828;">${escapeHtml(window.reportDate)}</h1>
      <p style="margin:0 0 24px;color:#667085;">Previous Lagos calendar day, ${escapeHtml(window.start.toISOString())} to ${escapeHtml(window.end.toISOString())}.</p>
      ${renderNoticeList(unavailableNotes)}

      <section style="margin-bottom:16px;padding:16px;border:1px solid #eaecf0;border-radius:8px;background:#ffffff;">
        <h2 style="margin:0 0 10px;font-size:16px;color:#101828;">Database activity from last review</h2>
        ${renderMetricCards([
          { label: "Jobs created", value: database.daily.jobs },
          { label: "Customers added", value: database.daily.customers },
          { label: "Templates created", value: database.daily.templates },
          { label: "Follow-ups created", value: database.daily.followUps },
          { label: "Messages logged", value: database.daily.messageLogs },
          { label: "Users created", value: database.daily.users },
          { label: "Workspaces created", value: database.daily.workspaces },
        ])}
      </section>

      <section style="margin-bottom:16px;padding:16px;border:1px solid #eaecf0;border-radius:8px;background:#ffffff;">
        <h2 style="margin:0 0 10px;font-size:16px;color:#101828;">Current platform totals</h2>
        ${renderMetricCards([
          { label: "Total jobs", value: database.totals.jobs },
          { label: "Total customers", value: database.totals.customers },
          { label: "Total templates", value: database.totals.templates },
          { label: "Total follow-ups", value: database.totals.followUps },
          { label: "Total messages", value: database.totals.messageLogs },
          { label: "Total users", value: database.totals.users },
          { label: "Total workspaces", value: database.totals.workspaces },
        ])}
      </section>

      <section style="margin-bottom:16px;padding:16px;border:1px solid #eaecf0;border-radius:8px;background:#ffffff;">
        <h2 style="margin:0 0 10px;font-size:16px;color:#101828;">Top workspaces by daily activity</h2>
        ${renderTopWorkspaces(database.topWorkspaces)}
      </section>

      <section style="margin-bottom:16px;padding:16px;border:1px solid #eaecf0;border-radius:8px;background:#ffffff;">
        <h2 style="margin:0 0 10px;font-size:16px;color:#101828;">Follow-ups by status</h2>
        ${renderStatusRows(database.followUpsByStatus)}
      </section>

      <section style="margin-bottom:16px;padding:16px;border:1px solid #eaecf0;border-radius:8px;background:#ffffff;">
        <h2 style="margin:0 0 10px;font-size:16px;color:#101828;">Workspaces by billing status</h2>
        ${renderStatusRows(database.workspacesByStatus)}
      </section>

      <div style="display:grid;gap:16px;">
        ${renderSection("Website overview", analytics.metrics)}
        ${renderSection("Top routes", analytics.routes)}
        ${renderSection("Top referrers", analytics.referrers)}
        ${renderSection("Top events", analytics.events)}
      </div>
    </main>
  </body>
</html>`;
}

async function sendEmail(env: EmailEnv, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: env.emailFrom,
      html,
      subject,
      to: [env.testEmail],
    }),
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => null)) as {
    error?: unknown;
    id?: string;
  } | null;

  if (!response.ok || payload?.error) {
    throw new Error(
      `Resend daily analytics review send failed: ${response.status}`,
    );
  }

  return payload?.id ?? null;
}

export const dailyAnalyticsReview = schedules.task({
  id: TASK_ID,
  cron: {
    pattern: "0 8 * * *",
    timezone: "Africa/Lagos",
  },
  maxDuration: 120,
  queue: {
    concurrencyLimit: 1,
  },
  run: async () => {
    const env = readAnalyticsReviewEnv();
    const window = getReportWindow();
    const unavailableNotes = [
      env.missingLoglyKeys.length > 0
        ? `Website analytics unavailable: ${missingReason(
            env.missingLoglyKeys,
          )}`
        : undefined,
      env.missingEmailKeys.length > 0
        ? `Email delivery skipped: ${missingReason(env.missingEmailKeys)}`
        : undefined,
    ].filter((note): note is string => Boolean(note));
    const [analytics, database] = await Promise.all([
      getAnalyticsReport(
        env.logly,
        window,
        env.missingLoglyKeys.length > 0
          ? missingReason(env.missingLoglyKeys)
          : undefined,
      ),
      getDatabaseReport(window),
    ]);
    const subject = `afterservice daily analytics review - ${window.reportDate}`;
    const html = renderEmail(window, analytics, database, unavailableNotes);
    const providerId = env.email
      ? await sendEmail(env.email, subject, html)
      : null;
    const deliveryStatus = env.email ? "sent" : "skipped";
    const databaseSummary = summarizeDatabaseReport(database);

    logger.info("Processed daily analytics review", {
      deliveryStatus,
      missingEmailKeys: env.missingEmailKeys,
      analyticsSections: Object.values(analytics).filter(
        (section) => section.rows.length > 0,
      ).length,
      missingLoglyKeys: env.missingLoglyKeys,
      providerId: providerId ? "set" : null,
      reportDate: window.reportDate,
      topWorkspaces: database.topWorkspaces.length,
    });

    return {
      ok: true,
      database: databaseSummary,
      deliveryStatus,
      missingEmailKeys: env.missingEmailKeys,
      missingLoglyKeys: env.missingLoglyKeys,
      providerId: providerId ? "set" : null,
      reportDate: window.reportDate,
      sentTo: env.email ? "TEST_EMAIL" : null,
    };
  },
});
