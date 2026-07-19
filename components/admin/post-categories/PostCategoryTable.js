"use client";
import React from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Avatar,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function PostCategoryTable({
  postCategories,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onTableChange,
  deletingId,
}) {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const getStatusColor = (isActive) => {
    return isActive ? "success" : "error";
  };

  const getStatusText = (isActive) => {
    return isActive ? "ใช้งาน" : "ไม่ใช้งาน";
  };

  const columns = [
    {
      title: "หมวดหมู่",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder:
        filters.sortBy === "name"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (name, record) => (
        <Space size={12}>
          <Avatar 
            icon={<TagOutlined />} 
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
      title: "สถานะ",
      dataIndex: "isActive",
      key: "isActive",
      sorter: true,
      sortOrder:
        filters.sortBy === "isActive"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (isActive) => (
        <Tag 
          color={getStatusColor(isActive)} 
          icon={isActive ? <TagOutlined /> : <DeleteOutlined />}
        >
          {getStatusText(isActive)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "จำนวนโพสต์",
      dataIndex: "posts",
      key: "postsCount",
      render: (posts) => (
        <Space>
          <FileTextOutlined style={{ color: "#8c8c8c" }} />
          <Text>{posts?.length || 0} โพสต์</Text>
        </Space>
      ),
      width: 120,
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortOrder:
        filters.sortBy === "createdAt"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (date) => (
        <Space size={8}>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>{formatDate(date)}</Text>
        </Space>
      ),
      width: 180,
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
              size="small"
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="ลบ">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => onDelete(record)}
              loading={deletingId === record.id}
            />
          </Tooltip>
        </Space>
      ),
      width: 160,
      fixed: "right",
    },
  ];

  return (
    <Card
      title={
        <Space>
          รายการหมวดหมู่โพสต์
          <Tag color="blue">{pagination?.totalCount || 0} รายการ</Tag>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={postCategories || []}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination?.page || 1,
          pageSize: pagination?.pageSize || 10,
          total: pagination?.totalCount || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} จาก ${total} รายการ`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={onTableChange}
        scroll={{ x: 1000 }}
        size="middle"
      />
    </Card>
  );
}
