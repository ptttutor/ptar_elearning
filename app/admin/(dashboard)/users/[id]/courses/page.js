"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Card,
  Typography,
  Space,
  Table,
  Tag,
  Input,
  InputNumber,
  DatePicker,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  BookOutlined,
  UserOutlined,
  EditOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useMessage } from "@/hooks/admin/useAntdApp";
import EditAccessModal from "@/components/admin/users/EditAccessModal";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";
import InfoBox from "@/components/admin/shared/InfoBox";

const { Title, Text } = Typography;
const { Search } = Input;

const GRANT_PAGE_SIZE = 10;

const STATUS_DISPLAY = {
  ACTIVE: { text: "กำลังเรียน", color: "processing" },
  COMPLETED: { text: "เรียนจบแล้ว", color: "success" },
  CANCELED: { text: "ยกเลิกแล้ว", color: "default" },
};

export default function UserCoursesPage() {
  const { id } = useParams();
  const router = useRouter();
  const message = useMessage();

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

  const [courseTableCourses, setCourseTableCourses] = useState([]);
  const [courseTableTotal, setCourseTableTotal] = useState(0);
  const [courseTableLoading, setCourseTableLoading] = useState(true);
  const [coursePage, setCoursePage] = useState(1);
  const [courseSearch, setCourseSearch] = useState("");
  const [knownCourseTitles, setKnownCourseTitles] = useState({});

  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [grantEndDate, setGrantEndDate] = useState(null);
  const [grantAccessHours, setGrantAccessHours] = useState(null);
  const [granting, setGranting] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
      } else {
        message.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
    } finally {
      setUserLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    setEnrollmentsLoading(true);
    try {
      const res = await fetch(`/api/admin/enrollments?userId=${id}`);
      const data = await res.json();
      if (res.ok) {
        setEnrollments(data.enrollments || []);
      } else {
        message.error(data.error || "ไม่สามารถโหลดคอร์สที่ถืออยู่ได้");
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดคอร์สที่ถืออยู่");
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const fetchCourseTable = async (page, search) => {
    setCourseTableLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(GRANT_PAGE_SIZE),
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/courses?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const list = data.data || [];
        setCourseTableCourses(list);
        setCourseTableTotal(data.pagination?.totalCount || 0);
        setKnownCourseTitles((prev) => {
          const next = { ...prev };
          list.forEach((c) => {
            next[c.id] = c.title;
          });
          return next;
        });
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setCourseTableLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchUser();
    fetchEnrollments();
    fetchCourseTable(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCourseSearch = (value) => {
    setCourseSearch(value);
    setCoursePage(1);
    fetchCourseTable(1, value);
  };

  const handleCoursePageChange = (page) => {
    setCoursePage(page);
    fetchCourseTable(page, courseSearch);
  };

  const heldCourseIds = useMemo(
    () => new Set(enrollments.map((e) => e.course?.id).filter(Boolean)),
    [enrollments]
  );

  const selectedCourseNames = selectedCourseIds.map((cid) => knownCourseTitles[cid] || cid);

  const handleGrant = async () => {
    if (selectedCourseIds.length === 0) return;
    setGranting(true);
    try {
      // New enrollments get enrolledAt = now server-side, so "now" is the
      // correct reference point for converting the picked end date into days.
      const accessDuration = grantEndDate
        ? Math.max(1, grantEndDate.startOf("day").diff(dayjs().startOf("day"), "day"))
        : null;

      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: id,
          courseIds: selectedCourseIds,
          accessDuration,
          accessHours: grantAccessHours ?? null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        message.error(data.error || "เกิดข้อผิดพลาดในการเพิ่มคอร์ส");
        return;
      }

      if (data.granted?.length) {
        message.success(`เพิ่มคอร์สสำเร็จ: ${data.granted.join(", ")}`);
      }
      if (data.alreadyEnrolled?.length) {
        message.info(`ผู้ใช้มีคอร์สนี้อยู่แล้ว: ${data.alreadyEnrolled.join(", ")}`);
      }

      setSelectedCourseIds([]);
      setGrantEndDate(null);
      setGrantAccessHours(null);
      fetchEnrollments();
    } catch (error) {
      console.error("Grant course error:", error);
      message.error("เกิดข้อผิดพลาดในการเพิ่มคอร์ส");
    } finally {
      setGranting(false);
    }
  };

  const openEditModal = (enrollment) => {
    setEditingEnrollment(enrollment);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingEnrollment(null);
  };

  const handleEditAccess = async ({ accessDuration, accessHours }) => {
    if (!editingEnrollment?.id) return;
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: editingEnrollment.id,
          accessDuration,
          accessHours,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        message.error(data.error || "เกิดข้อผิดพลาดในการแก้ไข");
        return;
      }

      message.success("บันทึกระยะเวลาเรียนสำเร็จ");
      closeEditModal();
      fetchEnrollments();
    } catch (error) {
      console.error("Edit access error:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไข");
    }
  };

  const handleCancelEnrollment = async (enrollment) => {
    try {
      const res = await fetch(
        `/api/admin/enrollments?enrollmentId=${encodeURIComponent(enrollment.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok) {
        message.error(data.error || "เกิดข้อผิดพลาดในการยกเลิกคอร์ส");
        return;
      }

      message.success("ยกเลิกคอร์สสำเร็จ");
      fetchEnrollments();
    } catch (error) {
      console.error("Cancel enrollment error:", error);
      message.error("เกิดข้อผิดพลาดในการยกเลิกคอร์ส");
    }
  };

  const columns = [
    {
      title: "คอร์ส",
      key: "course",
      render: (_, record) => record.course?.title || "-",
    },
    {
      title: "สถานะ",
      key: "status",
      width: 140,
      render: (_, record) => {
        const display = STATUS_DISPLAY[record.status] || { text: record.status, color: "default" };
        return <Tag color={display.color}>{display.text}</Tag>;
      },
    },
    {
      title: "แหล่งที่มา",
      key: "source",
      width: 130,
      render: (_, record) =>
        record.isPurchased ? (
          <Tag color="green">ซื้อปกติ</Tag>
        ) : (
          <Tag color="gold">Admin เพิ่มให้</Tag>
        ),
    },
    {
      title: "ความคืบหน้า",
      key: "progress",
      width: 120,
      render: (_, record) => `${Math.round(record.progress || 0)}%`,
    },
    {
      title: "วันที่ลงทะเบียน",
      key: "enrolledAt",
      width: 180,
      render: (_, record) =>
        record.enrolledAt ? new Date(record.enrolledAt).toLocaleString("th-TH") : "-",
    },
    {
      title: "ระยะเวลาที่เรียนได้",
      key: "accessDuration",
      width: 160,
      render: (_, record) => {
        const isOverride = record.accessDuration != null;
        const resolvedDays = record.accessDuration ?? record.course?.accessDuration ?? 60;
        const resolvedHours = record.accessHours ?? record.course?.accessHours;
        return (
          <span>
            {resolvedDays} วัน{resolvedHours != null ? ` / ${resolvedHours} ชม.` : ""}
            {!isOverride && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {" "}
                (ค่าเริ่มต้น)
              </Text>
            )}
          </span>
        );
      },
    },
    {
      title: "วันหมดอายุ",
      key: "expiresAt",
      width: 180,
      render: (_, record) => {
        if (!record.enrolledAt) return "-";
        const resolvedDays = record.accessDuration ?? record.course?.accessDuration ?? 60;
        const expiresAt = new Date(
          new Date(record.enrolledAt).getTime() + resolvedDays * 24 * 60 * 60 * 1000
        );
        const isExpired = expiresAt < new Date();
        return (
          <Text type={isExpired ? "danger" : undefined}>
            {expiresAt.toLocaleDateString("th-TH")}
          </Text>
        );
      },
    },
    {
      title: "จัดการ",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="แก้ไขระยะเวลาเรียน">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="ยกเลิกคอร์สนี้ (ลบออกจากรายการถาวร)">
            <Popconfirm
              title="ยกเลิกคอร์สนี้?"
              description="จะลบรายการนี้ออกถาวร รวมถึงความคืบหน้าการเรียน กู้คืนไม่ได้"
              okText="ยกเลิกคอร์ส"
              cancelText="ปิด"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleCancelEnrollment(record)}
            >
              <Button type="text" danger icon={<StopOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AdminPageHeader
      icon={<BookOutlined />}
      title="จัดการคอร์สผู้ใช้"
      subtitle={user && !userLoading ? `${user.name || "ไม่ระบุชื่อ"} (${user.email})` : undefined}
      breadcrumbItems={[
        { href: "/admin/users", label: (<Space size={4}><UserOutlined /><span>จัดการผู้ใช้งาน</span></Space>) },
        { label: (<Space size={4}><BookOutlined /><span>จัดการคอร์สผู้ใช้</span></Space>) },
      ]}
      onBack={() => router.back()}
    >
      {/* Held courses */}
      <Card title="คอร์สที่ถืออยู่" style={{ marginBottom: "24px" }}>
        <Table
          columns={columns}
          dataSource={enrollments}
          loading={enrollmentsLoading}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: "ยังไม่มีคอร์สที่ถืออยู่" }}
        />
      </Card>

      {/* Grant courses */}
      <Card title="เพิ่มคอร์สให้ผู้ใช้ (ไม่ผ่านการซื้อ)">
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Search
            placeholder="ค้นหาคอร์สจากชื่อ..."
            allowClear
            onSearch={handleCourseSearch}
            style={{ maxWidth: 400 }}
          />

          <Table
            size="small"
            rowKey="id"
            loading={courseTableLoading}
            dataSource={courseTableCourses}
            locale={{ emptyText: "ไม่พบคอร์ส" }}
            pagination={{
              current: coursePage,
              pageSize: GRANT_PAGE_SIZE,
              total: courseTableTotal,
              onChange: handleCoursePageChange,
              showSizeChanger: false,
            }}
            rowSelection={{
              selectedRowKeys: selectedCourseIds,
              onChange: (keys) => setSelectedCourseIds(keys),
              getCheckboxProps: (record) => ({ disabled: heldCourseIds.has(record.id) }),
            }}
            columns={[
              {
                title: "คอร์ส",
                key: "title",
                render: (_, record) => (
                  <Space>
                    {record.title}
                    {heldCourseIds.has(record.id) && <Tag color="default">ถืออยู่แล้ว</Tag>}
                  </Space>
                ),
              },
              {
                title: "หมวดหมู่",
                key: "category",
                width: 200,
                render: (_, record) => record.category?.name || "-",
              },
            ]}
          />

          {selectedCourseIds.length > 0 && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                เลือกไว้ {selectedCourseIds.length} คอร์ส: {selectedCourseNames.join(", ")}
              </Text>
              <Button type="link" size="small" onClick={() => setSelectedCourseIds([])}>
                ล้างที่เลือก
              </Button>
            </div>
          )}

          <Space wrap size="middle" style={{ width: "100%" }}>
            <div>
              <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>
                วันที่สิ้นสุดการเรียน (เว้นว่าง = ใช้ค่าเริ่มต้นของคอร์ส)
              </div>
              <DatePicker
                style={{ width: 220 }}
                format="D MMM YYYY"
                allowClear
                value={grantEndDate}
                onChange={setGrantEndDate}
                disabledDate={(current) => current && current < dayjs().startOf("day")}
              />
            </div>
            <div>
              <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>
                จำนวนชั่วโมงที่เรียนได้ (เว้นว่าง = ใช้ค่าเริ่มต้นของคอร์ส)
              </div>
              <InputNumber
                min={1}
                style={{ width: 220 }}
                placeholder="เช่น 120"
                value={grantAccessHours}
                onChange={setGrantAccessHours}
              />
            </div>
          </Space>

          <Button
            type="primary"
            onClick={handleGrant}
            loading={granting}
            disabled={selectedCourseIds.length === 0}
          >
            เพิ่มคอร์สที่เลือก ({selectedCourseIds.length})
          </Button>

          <InfoBox tone="warning">
            <strong>หมายเหตุ:</strong> การเพิ่มคอร์สด้วยวิธีนี้จะข้ามขั้นตอนการชำระเงินทั้งหมด
            ผู้ใช้จะได้สิทธิ์เข้าถึงคอร์สทันที
          </InfoBox>
        </Space>
      </Card>

      <EditAccessModal
        open={editModalOpen}
        enrollment={editingEnrollment}
        onCancel={closeEditModal}
        onSubmit={handleEditAccess}
      />
    </AdminPageHeader>
  );
}
