import { Modal, Form, InputNumber, DatePicker, Typography, Space } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";
import { MODAL_WIDTH } from "@/components/admin/shared/adminUiConstants";

const { Text } = Typography;

export default function EditAccessModal({ open, enrollment, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && enrollment) {
      const resolvedDays = enrollment.accessDuration ?? enrollment.course?.accessDuration ?? 60;
      const enrolledAt = enrollment.enrolledAt ? dayjs(enrollment.enrolledAt) : dayjs();
      form.setFieldsValue({
        // Only prefill the picker with a computed date when this enrollment has
        // its own override — otherwise leave it blank so "ใช้ค่าเริ่มต้นของคอร์ส"
        // stays visually true until the admin actively picks a date.
        endDate: enrollment.accessDuration != null ? enrolledAt.add(resolvedDays, "day") : null,
        accessHours: enrollment.accessHours ?? null,
      });
    }
  }, [open, enrollment, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const enrolledAt = enrollment?.enrolledAt ? dayjs(enrollment.enrolledAt) : dayjs();
    const accessDuration = values.endDate
      ? Math.max(1, values.endDate.startOf("day").diff(enrolledAt.startOf("day"), "day"))
      : null;

    await onSubmit({
      accessDuration,
      accessHours: values.accessHours ?? null,
    });
  };

  const resolvedDefaultEndDate = enrollment
    ? dayjs(enrollment.enrolledAt ?? undefined).add(
        enrollment.course?.accessDuration ?? 60,
        "day"
      )
    : null;

  return (
    <Modal
      title="แก้ไขระยะเวลาเรียนสำหรับผู้ใช้นี้"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="บันทึก"
      cancelText="ยกเลิก"
      width={MODAL_WIDTH.sm}
    >
      {enrollment && (
        <Space direction="vertical" size={0} style={{ marginBottom: 16 }}>
          <Text type="secondary">คอร์ส:</Text>
          <Text strong>{enrollment.course?.title}</Text>
          {resolvedDefaultEndDate && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              วันสิ้นสุดเริ่มต้นของคอร์ส (ถ้าไม่กำหนดเอง): {resolvedDefaultEndDate.format("D MMM YYYY")}
            </Text>
          )}
        </Space>
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="endDate"
          label="วันที่สิ้นสุดการเรียน (เว้นว่าง = ใช้ค่าเริ่มต้นของคอร์ส)"
        >
          <DatePicker style={{ width: "100%" }} format="D MMM YYYY" allowClear />
        </Form.Item>
        <Form.Item name="accessHours" label="จำนวนชั่วโมงที่เรียนได้ (เว้นว่าง = ใช้ค่าเริ่มต้นของคอร์ส)">
          <InputNumber min={1} style={{ width: "100%" }} placeholder="เช่น 120" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
