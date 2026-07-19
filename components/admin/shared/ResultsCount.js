import { Typography } from "antd";

const { Text } = Typography;

/**
 * Standardized "แสดง X จาก Y รายการ" text for filter bars — replaces the
 * 4 different formats that used to exist across admin sections.
 */
export default function ResultsCount({ current, total, itemLabel = "รายการ", style }) {
  return (
    <Text type="secondary" style={style}>
      แสดง {current ?? 0} จาก {total ?? 0} {itemLabel}
    </Text>
  );
}
