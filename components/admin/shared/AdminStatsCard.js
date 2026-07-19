import { Card, Statistic } from "antd";

/**
 * One stat-summary card: colored icon box + big number, on a tinted card
 * background. Extracted from UserStatsCards.js so every admin section can
 * show summary stats the same way. Usage: map your stats array to
 * <AdminStatsCard key={...} {...stat} /> inside a Row/Col grid.
 */
export default function AdminStatsCard({ title, value, icon, color, extra }) {
  return (
    <Card style={{ background: `${color}0d`, border: `1px solid ${color}20` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            background: `${color}15`,
            padding: "12px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <Statistic
            title={<span style={{ fontSize: "14px", color: "#666" }}>{title}</span>}
            value={value}
            valueStyle={{ color, fontSize: "24px", fontWeight: "bold" }}
          />
          {extra && (
            <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: "4px" }}>
              {extra}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
