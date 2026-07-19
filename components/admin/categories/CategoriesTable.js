"use client";
import React from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Avatar,
  Typography,
  Tooltip,
} from "antd";
import {
  AppstoreOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TagOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function CategoriesTable({
  categories,
  loading,
  onEdit,
  onDelete,
  disabled = false,
  deleting = null,
}) {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const columns = [
    {
      title: "หมวดหมู่",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Space size={12}>
          <Avatar
            icon={<AppstoreOutlined />}
            style={{ backgroundColor: "#1890ff" }}
            size="default"
          />
          <div>
            <div>
              <Text strong style={{ fontSize: "14px" }}>
                {name}
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
      title: "รายละเอียด",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <Space size={8}>
          <FileTextOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>
            {description || <Text type="secondary">ไม่มีรายละเอียด</Text>}
          </Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: "สถานะ",
      key: "status",
      render: () => (
        <Tag color="success" style={{ borderRadius: "4px" }}>
          <TagOutlined style={{ marginRight: "4px" }} />
          ใช้งาน
        </Tag>
      ),
      width: 100,
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
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      render: (_, record) => (
        <Space size={8} wrap>
          <Tooltip title="แก้ไข">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              disabled={disabled}
            />
          </Tooltip>
          <Tooltip title="ลบ">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record.id, record.name)}
              loading={deleting === record.id}
              disabled={disabled || (deleting && deleting !== record.id)}
            />
          </Tooltip>
        </Space>
      ),
      width: 150,
      fixed: "right",
    },
  ];

  return (
    <Card
      title={
        <Space>
          รายการหมวดหมู่
          <Tag color="blue" style={{ marginLeft: "8px" }}>
            {categories.length} รายการ
          </Tag>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} จาก ${total} รายการ`,
        }}
        size="middle"
      />
    </Card>
  );
}