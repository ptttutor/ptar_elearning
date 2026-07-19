"use client";
import React from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { MODAL_WIDTH } from "@/components/admin/shared/adminUiConstants";

const { Text } = Typography;

export default function ChapterModal({
  open,
  editing,
  form,
  onCancel,
  onSubmit,
  submitting = false,
}) {
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (e) {
      // validation error
    }
  };

  return (
    <Modal
      title={
        <Space>
          {editing ? <EditOutlined /> : <PlusOutlined />}
          <Text strong>
            {editing ? "แก้ไข Chapter" : "สร้าง Chapter ใหม่"}
          </Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={editing ? "อัพเดท" : "สร้าง"}
      cancelText="ยกเลิก"
      confirmLoading={submitting}
      width={MODAL_WIDTH.sm}
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          name="title"
          label="ชื่อ Chapter"
          rules={[{ required: true, message: "กรุณากรอกชื่อ Chapter" }]}
        >
          <Input 
            placeholder="ใส่ชื่อ Chapter" 
            prefix={<BookOutlined style={{ color: "#1890ff" }} />}
          />
        </Form.Item>

        <Form.Item
          name="order"
          label="ลำดับ"
          rules={[
            { required: true, message: "กรุณากรอกลำดับ" },
            { type: "number", min: 1, message: "ลำดับต้องมากกว่า 0" },
          ]}
        >
          <InputNumber
            min={1}
            style={{ width: "100%" }}
            placeholder="ลำดับของ Chapter"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
