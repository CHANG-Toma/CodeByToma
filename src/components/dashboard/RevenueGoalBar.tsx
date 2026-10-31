import { formatEur } from "@/lib/money";

type Props = {
  collectedCents: number;
  expectedCents: number;
  goalCents: number | null;
};

export function RevenueGoalBar({
  collectedCents,
  expectedCents,
  goalCents,
}: Props) {
  const progress =
    goalCents && goalCents > 0
      ? Math.min(100, Math.round((collectedCents / goalCents) * 100))
      : null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-dash-muted">
        <span>
          CA prévu :{" "}
          <span className="font-medium text-dash-soft">
            {formatEur(expectedCents)}
          </span>
        </span>
        {goalCents != null && goalCents > 0 ? (
          <span>
            Objectif :{" "}
            <span className="font-medium text-dash-soft">
              {formatEur(goalCents)}
            </span>
            {progress != null ? ` · ${progress} %` : null}
          </span>
        ) : (
          <span className="text-dash-muted2">Objectif non défini</span>
        )}
      </div>
      {goalCents != null && goalCents > 0 ? (
        <div
          className="h-2 overflow-hidden rounded-full bg-dash-input"
          role="progressbar"
          aria-valuenow={progress ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progression vers l’objectif de CA du mois"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500/80 to-cyan-400/80 transition-[width]"
            style={{ width: `${progress ?? 0}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
