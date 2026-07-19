"use client";
import { Card, Input, Select, Button, Typography, Space } from "antd";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";
import ResultsCount from "@/components/admin/shared/ResultsCount";
import { RESET_FILTERS_LABEL } from "@/components/admin/shared/adminUiConstants";

const { Option } = Select;
const { Text } = Typography;

export default function ExamCategoryFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onSearch,
  onReset,
  totalCount,
  currentCount,
}) {
  const handleReset = () => {
    setSearchInput("");
    onReset();
  };

  return (
    <Card style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "end",
          marginBottom: "16px",
        }}
      >
        {/* Search */}
        <div style={{ minWidth: "250px", flex: 1 }}>
          <Text strong>ค้นหา:</Text>
          <Input
            placeholder="ค้นหาชื่อหมวดหมู่หรือคำอธิบาย"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={onSearch}
            allowClear
            onClear={() => setSearchInput("")}
            style={{ marginTop: "4px" }}
            suffix={<SearchOutlined />}
          />
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: "150px" }}>
          <Text strong>สถานะ:</Text>
          <Select
            value={filters.isActive}
            onChange={(value) => onFilterChange("isActive", value)}
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="เลือกสถานะ"
            allowClear
          >
            <Option value="">ทั้งหมด</Option>
            <Option value="true">เปิดใช้งาน</Option>
            <Option value="false">ปิดใช้งาน</Option>
          </Select>
        </div>

        {/* Sort By */}
        <div style={{ minWidth: "150px" }}>
          <Text strong>เรียงตาม:</Text>
          <Select
            value={filters.sortBy}
            onChange={(value) => onFilterChange("sortBy", value)}
            style={{ width: "100%", marginTop: "4px" }}
          >
            <Option value="createdAt">วันที่สร้าง</Option>
            <Option value="updatedAt">วันที่แก้ไข</Option>
            <Option value="name">ชื่อหมวดหมู่</Option>
          </Select>
        </div>

        {/* Sort Order */}
        <div style={{ minWidth: "120px" }}>
          <Text strong>ลำดับ:</Text>
          <Select
            value={filters.sortOrder}
            onChange={(value) => onFilterChange("sortOrder", value)}
            style={{ width: "100%", marginTop: "4px" }}
          >
            <Option value="desc">ใหม่ → เก่า</Option>
            <Option value="asc">เก่า → ใหม่</Option>
          </Select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          <Button 
            type="primary" 
            icon={<SearchOutlined />}
            onClick={onSearch}
          >
            ค้นหา
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={handleReset}
          >
            {RESET_FILTERS_LABEL}
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div style={{ marginBottom: "16px" }}>
        <ResultsCount current={currentCount} total={totalCount} itemLabel="หมวดหมู่" />
        {filters.search && (
          <Text type="secondary"> | ค้นหา: &ldquo;<strong>{filters.search}</strong>&rdquo;</Text>
        )}
        {filters.isActive !== "" && (
          <Text type="secondary"> | สถานะ: <strong>{filters.isActive === "true" ? "เปิดใช้งาน" : "ปิดใช้งาน"}</strong></Text>
        )}
      </div>
    </Card>
  );
}