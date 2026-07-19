"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Upload, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

export default function PostContentModal({ visible, onCancel, onSubmit, postId, post, loading = false }) {
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState([{ id: Date.now(), urlImg: "", name: "", description: "", uploading: false }]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [existingContents, setExistingContents] = useState([]);
  const [fetchingContents, setFetchingContents] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchExistingContents = useCallback(async () => {
    if (!postId) return;
    try {
      setFetchingContents(true);
      const response = await fetch(`/api/admin/posts/${postId}/content`);
      const result = await response.json();
      if (result.success) setExistingContents(result.data || []);
      else console.error("Error fetching existing contents:", result.error);
    } catch (error) {
      console.error("Error fetching existing contents:", error);
    } finally {
      setFetchingContents(false);
    }
  }, [postId]);

  useEffect(() => {
    if (visible) {
      setContentItems([{ id: Date.now(), urlImg: "", name: "", description: "", uploading: false }]);
      setUploadProgress({});
      setExistingContents([]);
      if (postId) fetchExistingContents();
    }
  }, [visible, postId, fetchExistingContents]);

  const handleImageUpload = async (file, itemId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "post-content");

    try {
      setContentItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, uploading: true } : item)));
      setUploadProgress((prev) => ({ ...prev, [itemId]: 0 }));

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await response.json();

      if (result.success) {
        setContentItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, urlImg: result.url, uploading: false } : item)));
        setUploadProgress((prev) => ({ ...prev, [itemId]: 100 }));
        toast({ title: "อัปโหลดรูปภาพสำเร็จ" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาดในการอัปโหลด: ${error.message}` });
      setContentItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, uploading: false } : item)));
    }
  };

  const addContentItem = () => {
    setContentItems((prev) => [...prev, { id: Date.now(), urlImg: "", name: "", description: "", uploading: false }]);
  };

  const removeContentItem = (itemId) => {
    if (contentItems.length <= 1) return;
    setContentItems((prev) => prev.filter((item) => item.id !== itemId));
    setUploadProgress((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const updateContentItem = (itemId, field, value) => {
    setContentItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async () => {
    try {
      const validItems = contentItems.filter((item) => item.urlImg || item.name || item.description);
      if (validItems.length === 0) {
        toast({ variant: "destructive", title: "กรุณาเพิ่มเนื้อหาอย่างน้อย 1 รายการ" });
        return;
      }
      if (contentItems.some((item) => item.uploading)) {
        toast({ variant: "destructive", title: "กรุณารอให้การอัปโหลดเสร็จสิ้น" });
        return;
      }

      const submitData = validItems.map((item) => ({
        urlImg: item.urlImg || null,
        name: item.name || null,
        description: item.description || null,
      }));

      await onSubmit(submitData);
      if (postId) fetchExistingContents();
    } catch (error) {
      console.error("Submit error:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการบันทึก" });
    }
  };

  const deleteExistingContent = async (contentId) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/content?contentId=${contentId}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) {
        toast({ title: "ลบเนื้อหาสำเร็จ" });
        fetchExistingContents();
      } else {
        toast({ variant: "destructive", title: result.error || "เกิดข้อผิดพลาดในการลบ" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการลบ" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const newValidCount = contentItems.filter((item) => item.urlImg || item.name || item.description).length;

  return (
    <>
      <Dialog open={visible} onOpenChange={(next) => !next && onCancel()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              จัดการเนื้อหารูปภาพ
            </DialogTitle>
            {post?.title && <p className="text-sm text-gray-500">โพสต์: {post.title}</p>}
          </DialogHeader>

          <div className="space-y-6">
            <p className="text-sm text-gray-500">เพิ่มรูปภาพและข้อมูลสำหรับโพสต์ สามารถเพิ่มได้หลายรายการ</p>

            {existingContents.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <ImageIcon className="h-4 w-4" />
                  เนื้อหาที่มีอยู่ ({existingContents.length} รายการ)
                </div>
                <div className="space-y-3">
                  {existingContents.map((content, index) => (
                    <div key={content.id} className="rounded-lg border-2 border-emerald-200 p-3">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">เนื้อหาที่ {index + 1}</span>
                        <span className="text-xs text-gray-400">(สร้างเมื่อ: {new Date(content.createdAt).toLocaleString("th-TH")})</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-red-600"
                          onClick={() => setDeleteTarget({ type: "existing", id: content.id })}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> ลบ
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="text-center">
                          <div className="mb-2 text-xs font-medium text-gray-500">รูปภาพ</div>
                          {content.urlImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={content.urlImg} alt={content.name || "รูปภาพ"} className="mx-auto h-[120px] w-full rounded-md object-cover" />
                          ) : (
                            <div className="flex h-[120px] items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400">
                              ไม่มีรูปภาพ
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <div>
                            <div className="text-xs font-medium text-gray-500">ชื่อ / Caption</div>
                            <div className="text-sm">{content.name || "ไม่ระบุ"}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">คำอธิบาย</div>
                            <div className="text-sm">{content.description || "ไม่ระบุ"}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">ผู้สร้าง</div>
                            <div className="text-sm text-gray-500">{content.author?.name || content.author?.email || "ไม่ระบุ"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fetchingContents && (
              <div className="rounded-lg border p-5 text-center text-sm text-gray-500">กำลังโหลดเนื้อหาที่มีอยู่...</div>
            )}

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
                <Plus className="h-4 w-4" />
                เพิ่มเนื้อหาใหม่
              </div>
              <div className="space-y-3">
                {contentItems.map((item, index) => (
                  <div key={item.id} className={`rounded-lg border-2 p-3 ${item.urlImg ? "border-emerald-200" : "border-gray-200"}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-semibold">รายการที่ {index + 1}</span>
                      {contentItems.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" className="ml-auto text-red-600" onClick={() => removeContentItem(item.id)}>
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> ลบ
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="text-center">
                        <div className="mb-2 text-xs font-medium text-gray-500">รูปภาพ</div>
                        {item.urlImg ? (
                          <div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.urlImg} alt="รูปภาพ" className="mx-auto mb-2 h-[120px] w-full rounded-md object-cover" />
                            <label className="inline-block cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={item.uploading}
                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], item.id)}
                              />
                              <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium hover:bg-gray-50">
                                {item.uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                เปลี่ยนรูป
                              </span>
                            </label>
                          </div>
                        ) : (
                          <label className="block cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={item.uploading}
                              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], item.id)}
                            />
                            <div className={`flex h-[120px] flex-col items-center justify-center rounded-md border-2 border-dashed ${item.uploading ? "bg-gray-100" : "bg-gray-50"} border-gray-300`}>
                              {item.uploading ? (
                                <div className="w-full px-4">
                                  <Progress value={uploadProgress[item.id] || 0} className="mb-2 h-2" />
                                  <span className="text-xs text-gray-500">กำลังอัปโหลด...</span>
                                </div>
                              ) : (
                                <>
                                  <Plus className="h-6 w-6 text-gray-300" />
                                  <span className="mt-1 text-xs text-gray-500">คลิกเพื่อเลือกรูป</span>
                                </>
                              )}
                            </div>
                          </label>
                        )}
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <div>
                          <div className="mb-1 text-xs font-medium text-gray-500">ชื่อ / Caption</div>
                          <Input
                            placeholder="ชื่อรูปหรือ caption (ไม่บังคับ)"
                            value={item.name}
                            maxLength={100}
                            onChange={(e) => updateContentItem(item.id, "name", e.target.value)}
                          />
                        </div>
                        <div>
                          <div className="mb-1 text-xs font-medium text-gray-500">คำอธิบาย</div>
                          <Textarea
                            placeholder="คำอธิบายรูปภาพ (ไม่บังคับ)"
                            value={item.description}
                            rows={3}
                            maxLength={500}
                            onChange={(e) => updateContentItem(item.id, "description", e.target.value)}
                          />
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-emerald-600">
                          {item.urlImg && <span>✓ มีรูปภาพ</span>}
                          {item.name && <span>✓ มีชื่อ</span>}
                          {item.description && <span>✓ มีคำอธิบาย</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addContentItem}
                className="mt-3 w-full rounded-lg border-2 border-dashed border-blue-300 py-5 text-center text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                <Plus className="mx-auto mb-1 h-6 w-6" />
                เพิ่มรายการใหม่
              </button>
            </div>

            <div className="rounded-lg bg-emerald-50 p-4 text-center text-sm">
              <div className="mb-1 flex items-center justify-center gap-1.5 font-semibold text-emerald-700">
                <ImageIcon className="h-4 w-4" /> สรุปเนื้อหา
              </div>
              <div>
                เนื้อหาที่มีอยู่: <strong>{existingContents.length}</strong> รายการ
              </div>
              <div>
                เนื้อหาใหม่ที่จะเพิ่ม: <strong>{newValidCount}</strong> รายการ
              </div>
              <div className="mt-1 text-xs text-gray-500">รวมทั้งหมด: {existingContents.length + newValidCount} รายการ</div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              บันทึกทั้งหมด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(next) => !next && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ต้องการลบเนื้อหานี้?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteExistingContent(deleteTarget.id)}>ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
