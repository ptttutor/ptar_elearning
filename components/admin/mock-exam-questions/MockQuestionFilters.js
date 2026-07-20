import AdminFilterBar from "@/components/admin/shared/AdminFilterBar";

const QUESTION_TYPE_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "MULTIPLE_CHOICE", label: "เลือกตอบ" },
  { value: "TRUE_FALSE", label: "จริง/เท็จ" },
  { value: "SHORT_ANSWER", label: "ตอบสั้น" },
];

export default function MockQuestionFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  totalCount,
  currentCount,
  loading,
  topics,
}) {
  const topicOptions = [{ value: "all", label: "ทั้งหมด" }, ...(topics || []).map((t) => ({ value: t.id, label: t.name }))];

  return (
    <AdminFilterBar
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder="ค้นหาคำถาม..."
      selects={[
        { key: "questionType", label: "ประเภทคำถาม", value: filters.questionType, onChange: (v) => onFilterChange("questionType", v), placeholder: "ประเภทคำถาม", options: QUESTION_TYPE_OPTIONS },
        { key: "topicId", label: "หัวข้อ", value: filters.topicId, onChange: (v) => onFilterChange("topicId", v), placeholder: "หัวข้อ", options: topicOptions },
      ]}
      onReset={onReset}
      totalCount={totalCount}
      currentCount={currentCount}
      loading={loading}
      activeSummary={[
        filters.search && `ค้นหา: "${filters.search}"`,
        filters.questionType !== "all" && `ประเภท: ${QUESTION_TYPE_OPTIONS.find((o) => o.value === filters.questionType)?.label}`,
        filters.topicId !== "all" && `หัวข้อ: ${topicOptions.find((o) => o.value === filters.topicId)?.label}`,
      ]}
    />
  );
}
