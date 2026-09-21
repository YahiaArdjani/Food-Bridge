import type { ReactNode } from "react";

import {
  IMPACT_DISCLAIMER,
  formatCount,
  formatKg,
  formatMeals,
  impactFromKg,
} from "@/lib/impact";

type StatProps = {
  label: string;
  value: string;
  unit: string;
  /** Derived from an average factor rather than measured — badge it. */
  estimated?: boolean;
  detail?: string;
};

/** One headline figure. `dt`/`dd` live inside the caller's `<dl>`. */
function Stat({ label, value, unit, estimated = false, detail }: StatProps) {
  return (
    <div className="flex flex-col rounded-2xl border-2 border-husk-50/15 bg-husk-50/5 px-5 py-5">
      <dt className="font-mono text-[10px] tracking-label text-husk-300 uppercase">
        {label}
      </dt>
      <dd className="mt-3 font-display text-4xl leading-none font-semibold text-husk-50">
        {value}
        <span className="ml-1.5 text-sm font-medium text-husk-300">{unit}</span>
      </dd>

      {estimated ? (
        <span className="mt-4 inline-flex items-center self-start rounded-full border border-ember-300/40 bg-ember-500/10 px-2.5 py-0.5 font-mono text-[10px] tracking-[0.16em] text-ember-200 uppercase">
          Estimated
        </span>
      ) : null}

      {detail ? (
        <p className="mt-4 text-xs leading-relaxed text-husk-300">{detail}</p>
      ) : null}
    </div>
  );
}

type ImpactStatsProps = {
  eyebrow: string;
  heading: string;
  intro?: string;
  /** Rescued weight on its own — the three figures are derived from it. */
  totalKg: number;
  /** What the rescued weight is summed from, shown under that first figure. */
  totalDetail?: string;
  /** Platform-wide only: kitchens with at least one listing. */
  restaurantCount?: number;
  /** Platform-wide only: charities that have claimed at least one listing. */
  charityCount?: number;
  /** Extra line under the disclaimer, e.g. a link to the public page. */
  footnote?: ReactNode;
};

/**
 * The impact highlight band — a dark basil panel with the three ESG figures in
 * the same stamp/shadow idiom as the rest of the site.
 *
 * Presentational only: it takes a rescued weight and derives CO₂ and meals from
 * the shared factors in `lib/impact.ts`, so the public page and the restaurant
 * dashboard can never disagree. Every derived number is labelled "estimated"
 * and the disclaimer is part of the component, not of the caller.
 */
export function ImpactStats({
  eyebrow,
  heading,
  intro,
  totalKg,
  totalDetail,
  restaurantCount,
  charityCount,
  footnote,
}: ImpactStatsProps) {
  const { totalKg: kg, co2Kg, meals } = impactFromKg(totalKg);
  const hasCounts = restaurantCount !== undefined || charityCount !== undefined;

  return (
    <section className="relative overflow-hidden rounded-tile border-2 border-husk-950 bg-basil-950 px-7 py-12 text-husk-50 shadow-stamp-lg sm:px-12">
      <div
        aria-hidden="true"
        className="absolute -top-28 -right-20 h-80 w-80 rounded-full bg-ember-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-basil-500/25 blur-3xl"
      />

      <div className="relative">
        <span className="font-mono text-[11px] tracking-label text-ember-300 uppercase">
          {eyebrow}
        </span>
        <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight font-semibold sm:text-4xl">
          {heading}
        </h2>
        {intro ? (
          <p className="mt-4 max-w-2xl leading-relaxed text-husk-200">
            {intro}
          </p>
        ) : null}

        <dl className="mt-9 grid gap-4 sm:grid-cols-3">
          <Stat
            label="Food rescued"
            value={formatKg(kg)}
            unit="kg"
            detail={totalDetail}
          />
          <Stat
            label="CO₂ avoided"
            value={formatKg(co2Kg)}
            unit="kg CO₂e"
            estimated
          />
          <Stat
            label="Meals provided"
            value={formatMeals(meals)}
            unit={Math.round(meals) === 1 ? "meal" : "meals"}
            estimated
          />
        </dl>

        {hasCounts ? (
          <ul className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            {restaurantCount !== undefined ? (
              <li className="rounded-full border-2 border-husk-50/20 bg-husk-50/5 px-4 py-1.5 text-sm text-husk-100">
                <span className="font-display text-lg font-semibold text-husk-50">
                  {formatCount(restaurantCount)}
                </span>{" "}
                {restaurantCount === 1 ? "restaurant" : "restaurants"}{" "}
                participating
              </li>
            ) : null}

            {charityCount !== undefined ? (
              <li className="rounded-full border-2 border-husk-50/20 bg-husk-50/5 px-4 py-1.5 text-sm text-husk-100">
                <span className="font-display text-lg font-semibold text-husk-50">
                  {formatCount(charityCount)}
                </span>{" "}
                {charityCount === 1 ? "charity" : "charities"} served
              </li>
            ) : null}
          </ul>
        ) : null}

        <p className="mt-8 max-w-2xl border-t-2 border-dashed border-husk-50/20 pt-5 text-xs leading-relaxed text-husk-300">
          {IMPACT_DISCLAIMER}
        </p>

        {footnote ? (
          <div className="mt-4 text-sm leading-relaxed text-husk-200">
            {footnote}
          </div>
        ) : null}
      </div>
    </section>
  );
}
