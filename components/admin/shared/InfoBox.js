const TONE_STYLES = {
  warning: { background: "#fff7e6", border: "1px solid #ffd591", text: "#d48806" },
  info: { background: "#f6f8fa", border: "1px solid #d9d9d9", text: "#595959" },
  success: { background: "#f6ffed", border: "1px solid #b7eb8f", text: "#389e0d" },
};

/**
 * Small colored note box used inside modals/forms — replaces the ad hoc
 * hand-rolled <div> variants that used to exist per-modal.
 */
export default function InfoBox({ tone = "info", children, style }) {
  const t = TONE_STYLES[tone] || TONE_STYLES.info;
  return (
    <div
      style={{
        padding: "12px",
        background: t.background,
        border: t.border,
        borderRadius: "6px",
        ...style,
      }}
    >
      <div style={{ fontSize: "12px", color: t.text }}>{children}</div>
    </div>
  );
}
