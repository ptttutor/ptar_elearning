"use client";
import {
  Button,
  Card,
  Space,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
} from "antd";
import {
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ResultsCount from "@/components/admin/shared/ResultsCount";
import { RESET_FILTERS_LABEL } from "@/components/admin/shared/adminUiConstants";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function OrderFilters({
  filters,
  onFilterChange,
  onDateChange,
  onResetFilters,
  onRefresh,
  loading,
  totalCount,
  currentCount,
}) {
  const dateValue =
    filters.dateFrom && filters.dateTo
      ? [dayjs(filters.dateFrom), dayjs(filters.dateTo)]
      : null;

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      onDateChange(dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
    } else {
      onDateChange('', '');
    }
  };

  return (
    <Card style={{ marginBottom: "16px" }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <Search
            placeholder="ค้นหาคำสั่งซื้อ, ลูกค้า, สินค้า"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            style={{ width: '100%' }}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="สถานะการชำระเงิน"
            value={filters.paymentStatus || undefined}
            onChange={(value) => onFilterChange('paymentStatus', value || '')}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="PENDING">รอชำระ</Option>
            <Option value="PENDING_VERIFICATION">รอตรวจสอบ</Option>
            <Option value="COMPLETED">ชำระแล้ว</Option>
            <Option value="REJECTED">ปฏิเสธ</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="ประเภทสินค้า"
            value={filters.orderType || undefined}
            onChange={(value) => onFilterChange('orderType', value || '')}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="COURSE">คอร์สเรียน</Option>
            <Option value="EBOOK">หนังสือ</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <RangePicker
            value={dateValue}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            placeholder={["วันที่เริ่มต้น", "วันที่สิ้นสุด"]}
            style={{ width: '100%' }}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
            >
              รีเฟรช
            </Button>
            <Button
              icon={<FilterOutlined />}
              onClick={onResetFilters}
            >
              {RESET_FILTERS_LABEL}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Results Summary */}
      <Row style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
        <Col span={24}>
          <ResultsCount current={currentCount} total={totalCount} />
        </Col>
      </Row>
    </Card>
  );
}