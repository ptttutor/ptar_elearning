"use client";
import { Table, Card, Button, Space, Tag, Avatar, Typography, Tooltip } from "antd";
import {
  BookOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TagOutlined,
  CalendarOutlined,
  StarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudUploadOutlined,
  FileOutlined,
  FilePdfOutlined,
  InboxOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function EbookTable({
  ebooks,
  categories,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onManageFiles,
  onTableChange,
  actionLoading = {}, // { [ebookId]: { editing: boolean, deleting: boolean, managingFiles: boolean } }
}) {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString("th-TH") : "-";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const columns = [
    {
      title: "eBook",
      key: "ebook",
      sorter: true,
      sortOrder:
        filters.sortBy === "title"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (_, record) => (
        <Space size={12}>
          <Avatar 
            src={record.coverImageUrl && record.coverImageUrl.trim() ? record.coverImageUrl : null}
            icon={<BookOutlined />} 
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
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                <UserOutlined style={{ marginRight: "4px" }} />
                {record.author}
              </Text>
            </div>
            {record.isbn && (
              <div>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  ISBN: {record.isbn}
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
      dataIndex: "categoryId",
      key: "category",
      render: (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? (
          <Tag color="blue">
            <TagOutlined style={{ marginRight: "4px" }} />
            {category.name}
          </Tag>
        ) : (
          <Text type="secondary">ไม่ระบุ</Text>
        );
      },
      width: 120,
    },
    {
      title: "ราคา",
      key: "price",
      sorter: true,
      sortOrder:
        filters.sortBy === "price"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (_, record) => (
        <div>
          {record.discountPrice ? (
            <>
              <Text delete type="secondary" style={{ fontSize: "12px" }}>
                {formatPrice(record.price)}
              </Text>
              <br />
              <Text strong style={{ color: "#52c41a" }}>
                {formatPrice(record.discountPrice)}
              </Text>
            </>
          ) : (
            <Text strong>{formatPrice(record.price)}</Text>
          )}
        </div>
      ),
      width: 100,
    },
    {
      title: "รูปแบบ",
      key: "format",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Tag color="processing">{record.format}</Tag>
          {record.isPhysical && (
            <Tag color="orange" style={{ fontSize: "10px" }}>
              <InboxOutlined /> กายภาพ
            </Tag>
          )}
          {record.pageCount && (
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {record.pageCount} หน้า
            </Text>
          )}
          {record.publishedYear && (
            <Text type="secondary" style={{ fontSize: "11px" }}>
              <CalendarOutlined style={{ marginRight: "4px" }} />
              ปี {record.publishedYear}
            </Text>
          )}
        </Space>
      ),
      width: 100,
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
      title: "ไฟล์",
      key: "fileStatus",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          {record.fileUrl ? (
            <>
              <Tag color="success" icon={<FilePdfOutlined />}>
                มีไฟล์
              </Tag>
              {record.fileSize && (
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  {formatFileSize(record.fileSize)}
                </Text>
              )}
            </>
          ) : (
            <Tag color="default" icon={<FileOutlined />}>
              ไม่มีไฟล์
            </Tag>
          )}
        </Space>
      ),
      width: 100,
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
      width: 150,
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      render: (_, record) => {
        const recordLoading = actionLoading[record.id] || {};
        return (
          <Space size={8} wrap>
            <Tooltip title="แก้ไข">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
                loading={recordLoading.editing}
                disabled={recordLoading.editing || recordLoading.deleting || recordLoading.managingFiles}
              />
            </Tooltip>
            <Tooltip title="จัดการไฟล์">
              <Button
                type="text"
                icon={<CloudUploadOutlined />}
                onClick={() => onManageFiles(record)}
                loading={recordLoading.managingFiles}
                disabled={recordLoading.editing || recordLoading.deleting || recordLoading.managingFiles}
              />
            </Tooltip>
            <Tooltip title="ลบ">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record)}
                loading={recordLoading.deleting}
                disabled={recordLoading.editing || recordLoading.deleting || recordLoading.managingFiles}
              />
            </Tooltip>
          </Space>
        );
      },
      width: 200,
      fixed: "right",
    },
  ];

  return (
    <Card
      title={
        <Space>
          รายการ eBook
          <Tag color="blue" style={{ marginLeft: "8px" }}>
            {pagination.totalCount} รายการ
          </Tag>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={ebooks}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        onChange={onTableChange}
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
        size="middle"
      />
    </Card>
  );
}