/**
 * One stat-summary card: colored icon box + big number, on a tinted card
 * background. Extracted from UserStatsCards.js so every admin section can
 * show summary stats the same way. Usage: map your stats array to
 * <AdminStatsCard key={...} {...stat} /> inside a responsive grid.
 */
export default function AdminStatsCard({ title, value, icon, color, extra }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: `${color}0d`, borderColor: `${color}33` }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1f` }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-bold" style={{ color }}>
            {value}
          </div>
          {extra && <div className="mt-1 text-xs text-gray-400">{extra}</div>}
        </div>
      </div>
    </div>
  );
}
