const TONE_CLASSES = {
  warning: "bg-amber-50 border-amber-200 text-amber-700",
  info: "bg-gray-50 border-gray-200 text-gray-600",
  success: "bg-green-50 border-green-200 text-green-700",
};

/**
 * Small colored note box used inside modals/forms — replaces the ad hoc
 * hand-rolled <div> variants that used to exist per-modal.
 */
export default function InfoBox({ tone = "info", children, style, className }) {
  const toneClass = TONE_CLASSES[tone] || TONE_CLASSES.info;
  return (
    <div
      className={`rounded-md border p-3 text-xs ${toneClass} ${className || ""}`}
      style={style}
    >
      {children}
    </div>
  );
}
