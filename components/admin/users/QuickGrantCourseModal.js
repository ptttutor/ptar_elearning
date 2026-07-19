import { Modal, Form, Select, DatePicker, Typography, Space, Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { MODAL_WIDTH } from "@/components/admin/shared/adminUiConstants";

const { Option } = Select;
const { Text } = Typography;

export default function QuickGrantCourseModal({ open, user, onCancel, onSubmit }) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.resetFields();

    const loadCourses = async () => {
      setCoursesLoading(true);
      try {
        const res = await fetch("/api/admin/courses?pageSize=100");
        const data = await res.json();
        if (data.success) {
          setCourses(data.data || []);
        }
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setCoursesLoading(false);
      }
    };

    loadCourses();
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const accessDuration = values.endDate
        ? Math.max(1, values.endDate.startOf("day").diff(dayjs().startOf("day"), "day"))
        : null;
      await onSubmit(values.courseId, accessDuration);
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToFullPage = () => {
    if (!user?.id) return;
    onCancel();
    router.push(`/admin/users/${user.id}/courses`);
  };

  return (
    <Modal
      title="เพิ่มคอร์สให้ผู้ใช้ (ไม่ผ่านการซื้อ)"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="เพิ่มสิทธิ์เข้าถึง"
      cancelText="ยกเลิก"
      width={MODAL_WIDTH.sm}
    >
      {user && (
        <Space direction="vertical" size={0} style={{ marginBottom: 16 }}>
          <Text type="secondary">ผู้ใช้:</Text>
          <Text strong>{user.name || "ไม่ระบุชื่อ"}</Text>
          <Text type="secondary">{user.email}</Text>
        </Space>
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="courseId"
          label="เลือกคอร์ส"
          rules={[{ required: true, message: "กรุณาเลือกคอร์ส" }]}
        >
          <Select
            placeholder="ค้นหาคอร์ส..."
            showSearch
            optionFilterProp="children"
            loading={coursesLoading}
            notFoundContent={coursesLoading ? "กำลังโหลด..." : "ไม่พบคอร์ส"}
          >
            {courses.map((course) => (
              <Option key={course.id} value={course.id}>
                {course.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="endDate" label="วันที่สิ้นสุดการเรียน (เว้นว่าง = ใช้ค่าเริ่มต้นของคอร์ส)">
          <DatePicker
            style={{ width: "100%" }}
            format="D MMM YYYY"
            allowClear
            disabledDate={(current) => current && current < dayjs().startOf("day")}
          />
        </Form.Item>
      </Form>

      <Button
        type="link"
        icon={<ArrowRightOutlined />}
        onClick={goToFullPage}
        style={{ padding: 0 }}
      >
        จัดการคอร์สแบบเต็มระบบ
      </Button>
    </Modal>
  );
}
