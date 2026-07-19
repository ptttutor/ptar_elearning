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
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  StarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TagOutlined,
  LinkOutlined,
  FileImageOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function PostTable({
  posts,
  loading,
  onEdit,
  onDelete,
  onManageContent,
}) {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const columns = [
    {
      title: "โพสต์",
      key: "post",
      render: (_, record) => (
        <Space size={12}>
          <Avatar 
            src={record.imageUrl && record.imageUrl.trim() ? record.imageUrl : null}
            icon={<FileTextOutlined />} 
            size={50}
            shape="square"
          />
          <div>
            <div>
              <Text strong style={{ fontSize: "14px" }}>{record.title}</Text>
              {record.isFeatured && (
                <Tag color="gold" style={{ marginLeft: "8px" }}>
                  <StarOutlined /> แนะนำ
                </Tag>
              )}
            </div>
            {record.excerpt && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.excerpt.length > 80 
                    ? `${record.excerpt.substring(0, 80)}...` 
                    : record.excerpt}
                </Text>
              </div>
            )}
            {record.slug && (
              <div>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  <LinkOutlined style={{ marginRight: "4px" }} />
                  {record.slug}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
      width: 350,
    },
    {
      title: "ประเภท",
      key: "postType",
      render: (_, record) => (
        <Space size={8}>
          <TagOutlined style={{ color: "#8c8c8c" }} />
          {record.postType ? (
            <Tag color="blue">{record.postType.name}</Tag>
          ) : (
            <Tag color="default">ไม่ระบุ</Tag>
          )}
        </Space>
      ),
      width: 120,
    },
    {
      title: "ผู้เขียน",
      key: "author",
      render: (_, record) => (
        <Space size={8}>
          <UserOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>
            {record.author?.name || 'ไม่ระบุ'}
          </Text>
        </Space>
      ),
      width: 120,
    },
    {
      title: "สถานะ",
      dataIndex: "isActive",
      key: "status",
      render: (isActive) => (
        <Tag 
          color={isActive ? "success" : "error"}
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "วันที่เผยแพร่",
      dataIndex: "publishedAt",
      key: "publishedAt",
      render: (date) => (
        <Space size={8}>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          <Text style={{ fontSize: "13px" }}>{formatDate(date)}</Text>
        </Space>
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
          <Tooltip title="จัดการเนื้อหา">
            <Button
              type="text"
              icon={<FileImageOutlined />}
              size="small"
              onClick={() => onManageContent(record)}
            />
          </Tooltip>
          <Tooltip title="ลบ">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => onDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
      width: 200,
      fixed: "right",
    },
  ];

  return (
    <Card
      title={
        <Space>
          รายการโพสต์
          <Tag color="blue">{posts?.length || 0} รายการ</Tag>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={posts}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={false}
        size="middle"
      />
    </Card>
  );
}
