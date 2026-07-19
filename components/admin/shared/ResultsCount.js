/**
 * Standardized "แสดง X จาก Y รายการ" text for filter bars — replaces the
 * 4 different formats that used to exist across admin sections.
 */
export default function ResultsCount({ current, total, itemLabel = "รายการ", className }) {
  return (
    <span className={`text-sm text-gray-500 ${className || ""}`}>
      แสดง {current ?? 0} จาก {total ?? 0} {itemLabel}
    </span>
  );
}
