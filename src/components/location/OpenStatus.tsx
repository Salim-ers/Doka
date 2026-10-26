"use client";

import { useSyncExternalStore } from "react";
import { formatHour, siteConfig } from "@/data/site-config";

/** Jour (0 = lundi) et minutes écoulées, à l'heure de Paris. */
function parisNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return { day: days.indexOf(get("weekday")), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function subscribeMinute(cb: () => void) {
  const id = window.setInterval(cb, 60_000);
  return () => window.clearInterval(id);
}

/** Jour courant à Paris (0 = lundi), `null` côté serveur. */
export function useParisDay() {
  return useSyncExternalStore(
    subscribeMinute,
    () => parisNow().day,
    () => null,
  );
}

/** État d'ouverture sous forme de chaîne stable (« 1|libellé »), recalculé chaque minute. */
function statusKey() {
  const { day, minutes } = parisNow();
  const today = siteConfig.hours.days[day];
  if (!today) return "";
  const open = minutes >= toMin(today.open) && minutes < toMin(today.close);
  if (open) return `1|Ouvert maintenant, jusqu'à ${formatHour(today.close)}`;
  if (minutes < toMin(today.open)) return `0|Fermé, ouvre à ${formatHour(today.open)}`;
  const next = siteConfig.hours.days[(day + 1) % 7];
  return `0|Fermé, réouverture ${next.day.toLowerCase()} à ${formatHour(next.open)}`;
}

/**
 * Pastille « ouvert / fermé » calculée à l'heure de Paris à partir des horaires
 * de la configuration. Indicative : rendue uniquement côté client.
 */
export function OpenStatus() {
  const key = useSyncExternalStore(subscribeMinute, statusKey, () => "");
  if (!siteConfig.hours.show || !key) return <p className="open-status open-status--idle">Horaires ci-dessous</p>;
  const [flag, label] = key.split("|");
  const open = flag === "1";
  return (
    <p className="open-status" data-open={open ? "" : undefined}>
      <span className="open-status__dot" aria-hidden="true" />
      {label}
    </p>
  );
}
