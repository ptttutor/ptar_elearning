"use client";
import { Table, Card, Button, Space, Tag, Typography, Avatar, Tooltip } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TruckOutlined,
  SendOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  InboxOutlined,
  CarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function ShippingTable({
  shipments,
  loading,
  pagination,
  onViewDetail,
  onEdit,
  onTableChange,
  updatingId,
}) {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "default";
      case "PROCESSING":
        return "processing";
      case "SHIPPED":
        return "warning";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "รอดำเนินการ";
      case "PROCESSING":
        return "กำลังเตรียม";
      case "SHIPPED":
        return "จัดส่งแล้ว";
      case "DELIVERED":
        return "ส่งถึงแล้ว";
      case "CANCELLED":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const getCompanyIcon = (company) => {
    switch (company) {
      case "KERRY":
        return <TruckOutlined style={{ color: "#52c41a" }} />;
      case "THAILAND_POST":
        return <SendOutlined style={{ color: "#1890ff" }} />;
      case "JT_EXPRESS":
        return <InboxOutlined style={{ color: "#722ed1" }} />;
      case "FLASH_EXPRESS":
        return <ThunderboltOutlined style={{ color: "#fa8c16" }} />;
      case "NINJA_VAN":
        return <RocketOutlined style={{ color: "#eb2f96" }} />;
      default:
        return <CarOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const getCompanyName = (company) => {
    switch (company) {
      case "KERRY":
        return "Kerry Express";
      case "THAILAND_POST":
        return "ไปรษณีย์ไทย";
      case "JT_EXPRESS":
        return "J&T Express";
      case "FLASH_EXPRESS":
        return "Flash Express";
      case "NINJA_VAN":
        return "Ninja Van";
      case "PENDING":
        return "รอเลือก";
      default:
        return company || "ไม่ระบุ";
    }
  };

  const columns = [
    {
      title: "รหัสคำสั่งซื้อ",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId) => (
        <Text code style={{ fontSize: "12px" }}>
          #{orderId?.slice(-8)}
        </Text>
      ),
      width: 120,
      sorter: true,
    },
    {
      title: "ผู้รับ",
      dataIndex: "recipientName",
      key: "recipientName",
      render: (name, record) => (
        <Space size={12}>
          <Avatar icon={<UserOutlined />} size="default" />
          <div>
            <div>
              <Text strong>{name}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                <PhoneOutlined style={{ marginRight: "4px" }} />
                {record.recipientPhone}
              </Text>
            </div>
          </div>
        </Space>
      ),
      width: 200,
      sorter: true,
    },
    {
      title: "สินค้า",
      key: "product",
      render: (_, record) => {
        const isEbook = record.order?.ebook;
        const isCourse = record.order?.course;
        return (
          <Space direction="vertical" size={4}>
            <div>
              <Text strong style={{ fontSize: "13px" }}>
                {isEbook ? record.order.ebook.title : 
                 isCourse ? record.order.course.title : 'ไม่ระบุ'}
              </Text>
            </div>
            <div>
              <Tag 
                color={isEbook ? "blue" : isCourse ? "green" : "default"}
                style={{ fontSize: "11px" }}
              >
                {isEbook ? "📚 E-book" : isCourse ? "🎓 Course" : "อื่นๆ"}
              </Tag>
            </div>
          </Space>
        );
      },
      width: 180,
    },
    {
      title: "ที่อยู่",
      key: "address",
      render: (_, record) => (
        <Space size={8}>
          <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
          <div style={{ maxWidth: "200px" }}>
            <div>
              <Text style={{ fontSize: "14px" }}>{record.address}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.district}, {record.province} {record.postalCode}
              </Text>
            </div>
          </div>
        </Space>
      ),
      width: 220,
    },
    {
      title: "บริษัทขนส่ง",
      dataIndex: "shippingMethod",
      key: "shippingMethod",
      render: (company) => (
        <Space size={8}>
          <span style={{ fontSize: "16px" }}>{getCompanyIcon(company)}</span>
          <Text style={{ fontSize: "13px" }}>{getCompanyName(company)}</Text>
        </Space>
      ),
      width: 130,
      sorter: true,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      width: 120,
      sorter: true,
    },
    {
      title: "เลขติดตาม",
      dataIndex: "trackingNumber",
      key: "trackingNumber",
      render: (trackingNumber) =>
        trackingNumber ? (
          <Text code style={{ fontSize: "12px" }}>
            {trackingNumber}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
      width: 150,
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Space size={8}>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>{formatDate(date)}</Text>
        </Space>
      ),
      width: 150,
      sorter: true,
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      render: (_, record) => (
        <Space size={8} wrap>
          <Tooltip title="ดูรายละเอียด">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="อัพเดท">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit(record)}
              loading={updatingId === record.id}
            />
          </Tooltip>
        </Space>
      ),
      width: 180,
      fixed: "right",
    },
  ];

  return (
    <Card
      title={
        <Space>
          รายการจัดส่ง
          <Tag color="blue">{pagination?.totalCount || 0} รายการ</Tag>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={shipments}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.totalCount,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} จาก ${total} รายการ`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={onTableChange}
        size="middle"
      />
    </Card>
  );
}