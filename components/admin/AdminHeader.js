"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Avatar, Dropdown, Space, Typography, Tooltip } from "antd";
import {
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  KeyOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import ChangePasswordModal from "./ChangePasswordModal";

const { Text } = Typography;

export default function AdminHeader({ collapsed, onToggle, user, onLogout }) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // User menu items
  const userMenuItems = [
    {
      key: 'change-password',
      label: 'แก้ไขรหัสผ่าน',
      icon: <KeyOutlined />,
      onClick: () => setChangePasswordOpen(true),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'ออกจากระบบ',
      icon: <LogoutOutlined />,
      onClick: onLogout,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {/* Left side - Toggle button */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
      />

      {/* Right side - User info and actions */}
      <Space size="middle">
        {/* Back to home page */}
        <Tooltip title="กลับสู่หน้าหลัก">
          <Link href="/">
            <Button type="text" icon={<HomeOutlined />} />
          </Link>
        </Tooltip>

        {/* User Profile Dropdown */}
        <Dropdown
          menu={{
            items: userMenuItems,
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '8px' }}>
            <Avatar 
              size="default" 
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text strong style={{ fontSize: '14px', lineHeight: '1.2' }}>
                {user?.name || 'Admin User'}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.2' }}>
                ผู้ดูแลระบบ
              </Text>
            </div>
          </Space>
        </Dropdown>
      </Space>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
}
