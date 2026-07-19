"use client";
import { Modal, Form, Input, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useState } from "react";

export default function ChangePasswordModal({ open, onClose }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        messageApi.error(result.error || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
        return;
      }

      messageApi.success("เปลี่ยนรหัสผ่านสำเร็จ");
      handleClose();
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="แก้ไขรหัสผ่าน"
        open={open}
        onCancel={handleClose}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={loading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            name="oldPassword"
            label="รหัสผ่านเดิม"
            rules={[{ required: true, message: "กรุณากรอกรหัสผ่านเดิม" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="กรอกรหัสผ่านเดิม" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="รหัสผ่านใหม่"
            rules={[
              { required: true, message: "กรุณากรอกรหัสผ่านใหม่" },
              { min: 6, message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="กรอกรหัสผ่านใหม่" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="ยืนยันรหัสผ่านใหม่"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "กรุณายืนยันรหัสผ่านใหม่" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("รหัสผ่านใหม่ไม่ตรงกัน"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="ยืนยันรหัสผ่านใหม่" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
