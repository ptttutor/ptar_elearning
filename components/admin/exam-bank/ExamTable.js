"use client";
import { Table, Card, Space, Button, Tag, Badge, Avatar, Typography, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  FileOutlined,
  FolderOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function ExamTable({
  exams,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onManageFiles,
  onTableChange,
  deleting = false,
  deletingId = null,
}) {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const columns = [
    {
      title: "ข้อสอบ",
      key: "exam",
      render: (_, record) => (
        <Space size={12}>
          <Avatar
            icon={<FileOutlined />}
            style={{ backgroundColor: "#1890ff" }}
            size="default"
          />
          <div>
            <div>
              <Text strong style={{ fontSize: "14px" }}>
                {record.title}
              </Text>
            </div>
            {record.description && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.description.length > 50
                    ? `${record.description.substring(0, 50)}...`
                    : record.description}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
      width: 300,
    },
    {
      title: "หมวดหมู่",
      dataIndex: ["examCategory", "name"],
      key: "category",
      render: (categoryName) => (
        <Tag color="blue" icon={<FolderOutlined />}>
          {categoryName || "ไม่ระบุ"}
        </Tag>
      ),
      width: 150,
      sorter: true,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "จำนวนไฟล์",
      dataIndex: "fileCount",
      key: "fileCount",
      render: (fileCount) => (
        <Badge
          count={fileCount || 0}
          style={{ backgroundColor: fileCount > 0 ? "#52c41a" : "#d9d9d9" }}
          showZero
        />
      ),
      width: 120,
      align: "center",
      sorter: true,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "สถานะ",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isActive ? "success" : "error"}
        >
          {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </Tag>
      ),
      width: 120,
      align: "center",
      filters: [
        { text: "เปิดใช้งาน", value: true },
        { text: "ปิดใช้งาน", value: false },
      ],
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Space size={4}>
          <CalendarOutlined style={{ color: "#666" }} />
          <Text style={{ fontSize: "12px" }}>{formatDate(date)}</Text>
        </Space>
      ),
      width: 180,
      sorter: true,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_, record) => {
        const isDeleting = deleting && deletingId === record.id;
        
        return (
          <Space size={8}>
            <Tooltip title="จัดการไฟล์">
              <Button
                type="text"
                icon={<CloudUploadOutlined />}
                onClick={() => onManageFiles(record)}
                disabled={isDeleting}
              />
            </Tooltip>
            <Tooltip title="แก้ไข">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
                disabled={isDeleting}
              />
            </Tooltip>
            <Tooltip title="ลบ">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record)}
                loading={isDeleting}
                disabled={deleting && !isDeleting}
              />
            </Tooltip>
          </Space>
        );
      },
      width: 300,
      fixed: "right",
    },
  ];

  return (
    <Card
      title={
        <Space>
          รายการข้อสอบ
          <Tag color="blue" style={{ marginLeft: "8px" }}>
            {pagination.totalCount} รายการ
          </Tag>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={exams}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.totalCount,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} จาก ${total} รายการ`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={onTableChange}
        size="middle"
      />
    </Card>
  );
}
