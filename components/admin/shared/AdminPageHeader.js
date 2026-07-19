import { Card, Typography, Space, Button, Breadcrumb } from "antd";
import { ArrowLeftOutlined, HomeOutlined } from "@ant-design/icons";
import { ADMIN_PAGE_CONTAINER_STYLE } from "./adminUiConstants";

const { Title, Text } = Typography;

/**
 * Canonical admin page shell: outer padded container + a header Card with
 * icon/title/subtitle, an optional breadcrumb, an optional back button, and
 * an optional primary action (e.g. "+ เพิ่ม..."). Renders `children` below
 * the header, inside the same container, so every admin page shares one
 * layout instead of each page hand-rolling its own.
 *
 * `breadcrumbItems`: array of { label, href? } — "หน้าหลัก" (dashboard) is
 * added automatically as the first item, don't include it yourself.
 */
export default function AdminPageHeader({
  icon,
  title,
  subtitle,
  breadcrumbItems,
  onBack,
  actions,
  children,
}) {
  const items = breadcrumbItems
    ? [
        {
          href: "/admin/dashboard",
          title: (
            <Space size={4}>
              <HomeOutlined />
              <span>หน้าหลัก</span>
            </Space>
          ),
        },
        ...breadcrumbItems.map((item) => ({
          href: item.href,
          title: item.label,
        })),
      ]
    : null;

  return (
    <div style={ADMIN_PAGE_CONTAINER_STYLE}>
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size={items ? 12 : 4} style={{ width: "100%" }}>
          {items && <Breadcrumb items={items} />}
          <Space
            align="center"
            style={{ justifyContent: "space-between", width: "100%" }}
            wrap
          >
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0 }}>
                {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
                {title}
              </Title>
              {subtitle && <Text type="secondary">{subtitle}</Text>}
            </Space>
            <Space>
              {onBack && (
                <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                  กลับ
                </Button>
              )}
              {actions}
            </Space>
          </Space>
        </Space>
      </Card>

      {children}
    </div>
  );
}
