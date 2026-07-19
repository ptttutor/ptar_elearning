import { Modal, Form, Input, Select, Upload, Avatar, Row, Col, Space } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { uploadDiagnostics } from "@/lib/upload-diagnostics";
import { useMessage } from "@/hooks/admin/useAntdApp";
import InfoBox from "@/components/admin/shared/InfoBox";
import { MODAL_WIDTH } from "@/components/admin/shared/adminUiConstants";

const { Option } = Select;

export default function UserModal({ open, editing, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const message = useMessage();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          name: editing.name || "",
          email: editing.email || "",
          role: editing.role || "STUDENT",
          lineId: editing.lineId || "",
        });
        setImageUrl(editing.image || "");
      } else {
        form.resetFields();
        setImageUrl("");
      }
    }
  }, [open, editing, form]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const userData = {
        ...values,
        image: imageUrl,
      };

      await onSubmit(userData);
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.status === 'done') {
      // Handle successful upload
      const imageUrl = info.file.response?.data?.url || info.file.response?.url;
      if (imageUrl) {
        setImageUrl(imageUrl);
      }
    }
  };

  // Custom upload function for Vercel Blob
  const customUpload = async ({ file, onSuccess, onError, onProgress }) => {
    const monitor = uploadDiagnostics.createPerformanceMonitor();
    
    try {
      monitor.start();
      
      // Log file info and check compatibility
      uploadDiagnostics.logFileInfo(file, 'Upload ');
      const compatibility = uploadDiagnostics.checkFileCompatibility(file);
      
      if (!compatibility.compatible) {
        console.warn('⚠️ File compatibility issues detected, but proceeding:', compatibility.issues);
      }
      
      console.log('🚀 Starting upload:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'general'); // User profile images

      // Simulate progress
      onProgress({ percent: 30 });
      monitor.progress(30);

      const response = await fetch('/api/upload-blob', {
        method: 'POST',
        body: formData,
      });

      onProgress({ percent: 70 });
      monitor.progress(70);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload response error:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      onProgress({ percent: 90 });
      monitor.progress(90);

      console.log('📊 Upload result:', result);

      if (result.success) {
        onProgress({ percent: 100 });
        monitor.complete(result.data);
        
        // Show compression info if applicable
        if (result.data.compressed) {
          const originalSizeMB = (result.data.originalSize / 1024 / 1024).toFixed(2);
          const finalSizeMB = (result.data.size / 1024 / 1024).toFixed(2);
          message.success(`อัปโหลดสำเร็จ! บีบอัดจาก ${originalSizeMB}MB เป็น ${finalSizeMB}MB`);
        } else {
          message.success('อัปโหลดสำเร็จ!');
        }
        
        onSuccess(result, file);
      } else {
        console.error('❌ Upload failed:', result.error);
        monitor.error(new Error(result.error));
        onError(new Error(result.error || 'Upload failed'));
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      monitor.error(error);
      onProgress({ percent: 0 });
      onError(error);
      message.error(`การอัปโหลดล้มเหลว: ${error.message}`);
    }
  };

  // Upload props for image
  const uploadProps = {
    name: 'file',
    customRequest: customUpload,
    showUploadList: false,
    onChange: handleImageUpload,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น!');
        return false;
      }
      
      // Show file info
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.log('📄 File info:', { name: file.name, size: sizeMB + 'MB', type: file.type });
      
      return true;
    },
  };

  return (
    <Modal
      title={
        <Space>
          {editing ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={MODAL_WIDTH.sm}
      okText={editing ? "บันทึกการแก้ไข" : "สร้างผู้ใช้"}
      cancelText="ยกเลิก"
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: "24px" }}
      >
        {/* Profile Image */}
        <Form.Item label="รูปโปรไฟล์">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Avatar
              size={64}
              src={imageUrl && imageUrl.trim() ? imageUrl : null}
              icon={<UserOutlined />}
              style={{
                backgroundColor: imageUrl && imageUrl.trim() ? "transparent" : "#1890ff",
              }}
            />
            <Upload {...uploadProps}>
              <div style={{ cursor: "pointer", color: "#1890ff" }}>
                เปลี่ยนรูปภาพ
              </div>
            </Upload>
          </div>
        </Form.Item>

        <Row gutter={16}>
          {/* Name */}
          <Col span={12}>
            <Form.Item
              name="name"
              label="ชื่อผู้ใช้"
              rules={[
                { required: true, message: "กรุณากรอกชื่อผู้ใช้" },
                { min: 2, message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 2 ตัวอักษร" },
              ]}
            >
              <Input placeholder="กรอกชื่อผู้ใช้" />
            </Form.Item>
          </Col>

          {/* Role */}
          <Col span={12}>
            <Form.Item
              name="role"
              label="บทบาท"
              rules={[{ required: true, message: "กรุณาเลือกบทบาท" }]}
            >
              <Select placeholder="เลือกบทบาท">
                <Option value="STUDENT">นักเรียน</Option>
                <Option value="INSTRUCTOR">ผู้สอน</Option>
                <Option value="ADMIN">ผู้ดูแลระบบ</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Email */}
        <Form.Item
          name="email"
          label="อีเมล"
          rules={[
            { required: true, message: "กรุณากรอกอีเมล" },
            { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
          ]}
        >
          <Input placeholder="กรอกที่อยู่อีเมล" />
        </Form.Item>

        <Row gutter={16}>
          {/* LINE User ID */}
          <Col span={24}>
            <Form.Item
              name="lineId"
              label="LINE User ID"
            >
              <Input placeholder="U1234567890abcdef..." />
            </Form.Item>
          </Col>
        </Row>

        {/* Password (only for new users) */}
        {!editing && (
          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[
              { required: true, message: "กรุณากรอกรหัสผ่าน" },
              { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
            ]}
          >
            <Input.Password placeholder="กรอกรหัสผ่าน" />
          </Form.Item>
        )}
      </Form>

      {editing && (
        <InfoBox tone="warning" style={{ marginTop: "16px" }}>
          <strong>หมายเหตุ:</strong> การแก้ไขข้อมูลผู้ใช้จะมีผลทันที
        </InfoBox>
      )}
    </Modal>
  );
}
