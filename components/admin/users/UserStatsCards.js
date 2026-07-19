import { Card, Row, Col, Skeleton } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import AdminStatsCard from "@/components/admin/shared/AdminStatsCard";

export default function UserStatsCards({ stats, loading }) {
  if (loading) {
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {[...Array(4)].map((_, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Skeleton loading={true} active />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  const statCards = [
    {
      title: "ผู้ใช้งานทั้งหมด",
      value: stats.total || 0,
      icon: <UserOutlined style={{ fontSize: "24px", color: "#1890ff" }} />,
      color: "#1890ff",
    },
    {
      title: "นักเรียน",
      value: stats.students || 0,
      icon: <TeamOutlined style={{ fontSize: "24px", color: "#52c41a" }} />,
      color: "#52c41a",
    },
    {
      title: "ผู้สอน",
      value: stats.instructors || 0,
      icon: <BookOutlined style={{ fontSize: "24px", color: "#fa8c16" }} />,
      color: "#fa8c16",
    },
    {
      title: "ผู้ดูแลระบบ",
      value: stats.admins || 0,
      icon: <CrownOutlined style={{ fontSize: "24px", color: "#eb2f96" }} />,
      color: "#eb2f96",
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      {statCards.map((stat, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <AdminStatsCard {...stat} />
        </Col>
      ))}
    </Row>
  );
}
