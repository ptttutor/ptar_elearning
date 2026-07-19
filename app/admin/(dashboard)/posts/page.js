"use client";
import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [savingContent, setSavingContent] = useState(false);

  // Use custom hook for posts data
  const {
    posts,
    postTypes,
    authors,
    loading,
    searchInput,
    setSearchInput,
    filters,
    pagination,
    savePost,
    deletePost,
    handleFilterChange,
    handleSortSelectChange,
    handlePageChange,
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
      console.error("Error submitting post:", error);
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
      toast({ variant: "destructive", title: "ไม่พบ ID ของโพสต์" });
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
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาด: ${error.message}` });
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

  return (
    <AdminPageHeader
      icon={<FileText className="h-6 w-6" />}
      title="จัดการโพสต์"
      subtitle="จัดการบทความและเนื้อหาต่างๆ"
      actions={
        <Button onClick={() => openModal(null)}>
          <Plus className="mr-2 h-4 w-4" />
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
        onSortSelectChange={handleSortSelectChange}
        onReset={resetFilters}
        postTypes={postTypes}
        authors={authors}
        totalCount={pagination.totalCount}
        currentCount={posts.length}
        loading={loading}
      />

      <PostTable
        posts={posts}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={openModal}
        onDelete={handleDelete}
        onManageContent={handleManageContent}
      />

      {/* Create/Edit Modal */}
      <PostModal open={modalOpen} editing={editing} postTypes={postTypes} onCancel={closeModal} onSubmit={handleSubmitPost} />

      {/* Delete Confirmation Modal */}
      <DeleteModal open={deleteModalOpen} post={postToDelete} loading={deleting} onConfirm={confirmDelete} onCancel={cancelDelete} />

      {/* Post Content Management Modal */}
      <PostContentModal
        visible={contentModalOpen}
        postId={selectedPost?.id}
        post={selectedPost}
        loading={savingContent}
        onCancel={closeContentModal}
        onSubmit={async (contentItems) => {
          setSavingContent(true);
          try {
            const response = await fetch(`/api/admin/posts/${selectedPost.id}/content`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contentItems }),
            });

            const result = await response.json();

            if (result.success) {
              toast({ title: result.message || "เพิ่มเนื้อหาสำเร็จ" });
              closeContentModal();
            } else {
              throw new Error(result.error || "เกิดข้อผิดพลาดในการเพิ่มเนื้อหา");
            }
          } catch (error) {
            console.error("Submit error:", error);
            toast({ variant: "destructive", title: error.message || "เกิดข้อผิดพลาดในการเพิ่มเนื้อหา" });
          } finally {
            setSavingContent(false);
          }
        }}
      />
    </AdminPageHeader>
  );
}
