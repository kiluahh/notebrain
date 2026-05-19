import type { RegisteredTool } from "./registry";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// utcOffsetMinutes: positive = ahead of UTC (e.g. +480 for UTC+8)
function formatLocal(d: Date, utcOffsetMinutes: number): string {
  const localTime = new Date(d.getTime() + utcOffsetMinutes * 60000);
  const y = localTime.getUTCFullYear();
  const mo = pad(localTime.getUTCMonth() + 1);
  const day = pad(localTime.getUTCDate());
  const h = pad(localTime.getUTCHours());
  const mi = pad(localTime.getUTCMinutes());
  const s = pad(localTime.getUTCSeconds());
  const sign = utcOffsetMinutes >= 0 ? "+" : "-";
  const absH = pad(Math.floor(Math.abs(utcOffsetMinutes) / 60));
  const absM = pad(Math.abs(utcOffsetMinutes) % 60);
  return `${y}-${mo}-${day}T${h}:${mi}:${s}${sign}${absH}:${absM}`;
}

export const getCurrentTimeTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "getCurrentTime",
      description:
        "Get the current date and time. Returns local time with timezone info. Use timezoneOffset to query a specific timezone (e.g. '+8' for Beijing, '-5' for New York).",
      parameters: {
        type: "object",
        properties: {
          timezoneOffset: {
            type: "string",
            description: "UTC offset string like '+8', '-5', '+0'. Omit for local timezone.",
          },
        },
        required: [],
      },
    },
  },
  execute: (args: Record<string, unknown>) => {
    const now = new Date();
    const localOffset = -now.getTimezoneOffset();
    const tzOffset = args.timezoneOffset as string | undefined;

    if (tzOffset) {
      const offsetHours = parseInt(tzOffset, 10);
      if (isNaN(offsetHours)) {
        return JSON.stringify({
          error: `Invalid timezone offset: ${tzOffset}`,
          localDatetime: formatLocal(now, localOffset),
          localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          localOffsetHours: localOffset / 60,
        });
      }
      const targetOffsetMinutes = offsetHours * 60;
      return JSON.stringify({
        datetime: formatLocal(now, targetOffsetMinutes),
        timezone: `UTC${args.timezoneOffset}`,
        unixTimestamp: Math.floor(now.getTime() / 1000),
        dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long", timeZone: `Etc/GMT${offsetHours > 0 ? "-" : "+"}${Math.abs(offsetHours)}` }),
      });
    }

    return JSON.stringify({
      datetime: formatLocal(now, localOffset),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utcOffset: `UTC${localOffset >= 0 ? "+" : ""}${localOffset / 60}`,
      unixTimestamp: Math.floor(now.getTime() / 1000),
      dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
    });
  },
};
