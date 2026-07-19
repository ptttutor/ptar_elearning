"use client";
import { useState } from 'react';
import {
  Button,
  message,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import PostTable from "@/components/admin/posts/PostTable";
import PostModal from "@/components/admin/posts/PostModal";
import DeleteModal from "@/components/admin/posts/DeleteModal";
import PostFilters from "@/components/admin/posts/PostFilters";
import PostContentModal from "@/components/admin/posts/PostContentModal";

// Hooks
import { usePosts } from "@/hooks/admin/usePosts";

export default function PostsPage() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Use custom hook for posts data
  const {
    posts,
    postTypes,
    authors,
    loading,
    postTypesLoading,
    authorsLoading,
    searchInput,
    setSearchInput,
    filters,
    pagination,
    savePost,
    deletePost,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    resetFilters,
  } = usePosts();

  // Create or update post
  const handleSubmitPost = async (postData) => {
    try {
      const success = await savePost(postData, editing);
      if (success) {
        setModalOpen(false);
        setEditing(null);
      }
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setPostToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!postToDelete?.id) {
      message.error("ไม่พบ ID ของโพสต์");
      return;
    }

    setDeleting(true);

    try {
      const success = await deletePost(postToDelete.id);
      if (success) {
        setDeleteModalOpen(false);
        setPostToDelete(null);
      }
    } catch (error) {
      console.error("Delete post error:", error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };

  // Open modal for create/edit
  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  // Handle manage content
  const handleManageContent = (post) => {
    setSelectedPost(post);
    setContentModalOpen(true);
  };

  // Close content modal
  const closeContentModal = () => {
    setContentModalOpen(false);
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <AdminPageHeader
      icon={<FileTextOutlined />}
      title="จัดการโพสต์"
      subtitle="จัดการบทความและเนื้อหาต่างๆ"
      actions={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          เพิ่มโพสต์ใหม่
        </Button>
      }
    >
      {/* Filter Section */}
      <PostFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        postTypes={postTypes}
        totalCount={pagination.totalCount}
        currentCount={posts.length}
      />

      <PostTable
        posts={posts}
        loading={loading}
        onEdit={openModal}
        onDelete={handleDelete}
        onManageContent={handleManageContent}
      />

      {/* Create/Edit Modal */}
      <PostModal
        open={modalOpen}
        editing={editing}
        postTypes={postTypes}
        onCancel={closeModal}
        onSubmit={handleSubmitPost}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        post={postToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Post Content Management Modal */}
      <PostContentModal
        visible={contentModalOpen}
        postId={selectedPost?.id}
        post={selectedPost}
        onCancel={closeContentModal}
        onSubmit={async (contentItems) => {
          try {
            // Submit to API
            const response = await fetch(`/api/admin/posts/${selectedPost.id}/content`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contentItems: contentItems
              }),
            });

            const result = await response.json();

            if (result.success) {
              message.success(result.message || 'เพิ่มเนื้อหาสำเร็จ');
              closeContentModal();
            } else {
              throw new Error(result.error || 'เกิดข้อผิดพลาดในการเพิ่มเนื้อหา');
            }
          } catch (error) {
            console.error('Submit error:', error);
            message.error(error.message || 'เกิดข้อผิดพลาดในการเพิ่มเนื้อหา');
          }
        }}
      />
    </AdminPageHeader>
  );
}
