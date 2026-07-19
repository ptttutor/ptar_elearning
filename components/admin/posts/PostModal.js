"use client";
import { useState, useEffect, useRef } from "react";
import { FileText, Tag, Link as LinkIcon, Calendar, Monitor, Smartphone, Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { uploadDiagnostics } from "@/lib/upload-diagnostics";

const EMPTY_FORM = {
  title: "",
  postTypeId: "",
  slug: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  imageUrlMobileMode: "",
  publishedAt: "",
  isActive: true,
  isFeatured: false,
};

const generateSlug = (title) =>
  title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();

const toDatetimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function PostModal({ open, editing, postTypes, onCancel, onSubmit }) {
  const { toast } = useToast();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const desktopFileRef = useRef(null);
  const mobileFileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValues(
        editing
          ? { ...EMPTY_FORM, ...editing, publishedAt: toDatetimeLocal(editing.publishedAt) }
          : EMPTY_FORM
      );
      setErrors({});
    }
  }, [open, editing]);

  const set = (patch) => setValues((p) => ({ ...p, ...patch }));

  const handleTitleChange = (e) => {
    const title = e.target.value;
    set({ title, slug: generateSlug(title) });
  };

  const uploadImage = async (file, isMobile = false) => {
    const monitor = uploadDiagnostics.createPerformanceMonitor();
    const errorHandler = uploadDiagnostics.createErrorHandler("PostModal", {
      component: "PostModal",
      field: isMobile ? "imageUrlMobileMode" : "imageUrl",
      isMobile,
    });

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({ variant: "destructive", title: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP)" });
      return;
    }

    try {
      const compatibilityCheck = uploadDiagnostics.checkFileCompatibility(file);
      if (!compatibilityCheck.compatible) {
        throw new Error(compatibilityCheck.issues.join(", "));
      }
      if (compatibilityCheck.hasWarnings) {
        console.warn("File compatibility warnings detected, but proceeding:", compatibilityCheck.warnings);
      }

      if (isMobile) setUploadingMobile(true);
      else setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "post-image");

      const response = await fetch("/api/upload-blob", { method: "POST", body: formData });
      const data = await response.json();

      if (data.success) {
        set({ [isMobile ? "imageUrlMobileMode" : "imageUrl"]: data.data.url });
        monitor.end();
        toast({
          title: `อัพโหลดรูปภาพ${isMobile ? "มือถือ" : "เดสก์ท็อป"}สำเร็จ${data.data.compressionInfo?.wasCompressed ? " (ถูกบีบอัดเพื่อคุณภาพที่เหมาะสม)" : ""}`,
        });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("PostModal Upload error:", error);
      const handledError = errorHandler(error);
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ: ${handledError.userMessage}` });
    } finally {
      if (isMobile) setUploadingMobile(false);
      else setUploading(false);
    }
  };

  const deleteImage = async (imageUrl, isMobile = false) => {
    try {
      const fieldName = isMobile ? "imageUrlMobileMode" : "imageUrl";
      const response = await fetch(`/api/upload-blob/delete?url=${encodeURIComponent(imageUrl)}`, { method: "DELETE" });
      const data = await response.json();
      set({ [fieldName]: "" });
      toast({ title: data.success ? `ลบรูปภาพ${isMobile ? "มือถือ" : "เดสก์ท็อป"}สำเร็จ` : "ลบรูปภาพสำเร็จ" });
    } catch (error) {
      console.error("Delete error:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการลบรูปภาพ" });
    }
  };

  const validate = () => {
    const next = {};
    if (!values.title.trim()) next.title = "กรุณากรอกหัวข้อ";
    else if (values.title.trim().length < 2) next.title = "หัวข้อต้องมีอย่างน้อย 2 ตัวอักษร";
    else if (values.title.trim().length > 255) next.title = "หัวข้อต้องไม่เกิน 255 ตัวอักษร";
    if (!values.postTypeId) next.postTypeId = "กรุณาเลือกประเภทโพสต์";
    if (values.slug && !/^[a-z0-9-]+$/.test(values.slug)) next.slug = "Slug ต้องเป็นตัวอักษรเล็ก ตัวเลข และ - เท่านั้น";
    if (values.excerpt && values.excerpt.length > 500) next.excerpt = "สรุปต้องไม่เกิน 500 ตัวอักษร";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const submitData = {
        ...values,
        publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : null,
      };
      await onSubmit(submitData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขโพสต์" : "เพิ่มโพสต์ใหม่"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">หัวข้อ</Label>
            <Input id="title" placeholder="ใส่หัวข้อโพสต์" value={values.title} disabled={submitting} onChange={handleTitleChange} />
            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>ประเภทโพสต์</Label>
              <Select value={values.postTypeId} onValueChange={(v) => set({ postTypeId: v })} disabled={submitting}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.postTypeId && <p className="text-xs text-red-600">{errors.postTypeId}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" placeholder="url-slug" value={values.slug} disabled={submitting} onChange={(e) => set({ slug: e.target.value })} />
              {errors.slug && <p className="text-xs text-red-600">{errors.slug}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="excerpt">สรุป</Label>
            <Textarea id="excerpt" rows={3} placeholder="ใส่สรุปโพสต์" value={values.excerpt} disabled={submitting} maxLength={500} onChange={(e) => set({ excerpt: e.target.value })} />
            {errors.excerpt && <p className="text-xs text-red-600">{errors.excerpt}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">เนื้อหา</Label>
            <Textarea id="content" rows={8} placeholder="ใส่เนื้อหาโพสต์" value={values.content} disabled={submitting} onChange={(e) => set({ content: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>รูปภาพเดสก์ท็อป</Label>
              <Input placeholder="https://example.com/image.jpg" value={values.imageUrl} disabled={submitting} onChange={(e) => set({ imageUrl: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>รูปภาพมือถือ</Label>
              <Input placeholder="https://example.com/mobile-image.jpg" value={values.imageUrlMobileMode} disabled={submitting} onChange={(e) => set({ imageUrlMobileMode: e.target.value })} />
            </div>
          </div>

          <div className="rounded-md border border-gray-200 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              อัพโหลดรูปภาพ
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700">
                  <Monitor className="h-4 w-4" /> รูปภาพเดสก์ท็อป
                </div>
                {values.imageUrl && (
                  <div className="mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={values.imageUrl} alt="Desktop preview" className="mx-auto h-[120px] w-[200px] rounded-md object-cover" />
                    <Button type="button" variant="destructive" size="sm" className="mt-2" onClick={() => deleteImage(values.imageUrl, false)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> ลบรูป
                    </Button>
                  </div>
                )}
                <input
                  ref={desktopFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], false)}
                />
                <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => desktopFileRef.current?.click()}>
                  {uploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                  {uploading ? "กำลังอัพโหลด..." : "เลือกรูปภาพ"}
                </Button>
              </div>

              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700">
                  <Smartphone className="h-4 w-4" /> รูปภาพมือถือ
                </div>
                {values.imageUrlMobileMode && (
                  <div className="mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={values.imageUrlMobileMode} alt="Mobile preview" className="mx-auto h-[120px] w-[120px] rounded-md object-cover" />
                    <Button type="button" variant="destructive" size="sm" className="mt-2" onClick={() => deleteImage(values.imageUrlMobileMode, true)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> ลบรูป
                    </Button>
                  </div>
                )}
                <input
                  ref={mobileFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], true)}
                />
                <Button type="button" variant="outline" size="sm" disabled={uploadingMobile} onClick={() => mobileFileRef.current?.click()}>
                  {uploadingMobile ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                  {uploadingMobile ? "กำลังอัพโหลด..." : "เลือกรูปภาพ"}
                </Button>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-gray-400">รองรับไฟล์: JPG, PNG, WebP (รูปภาพขนาดใหญ่จะถูกบีบอัดอัตโนมัติ)</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="publishedAt">วันที่เผยแพร่</Label>
            <Input id="publishedAt" type="datetime-local" value={values.publishedAt} disabled={submitting} onChange={(e) => set({ publishedAt: e.target.value })} />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox id="isActive" checked={values.isActive} disabled={submitting} onCheckedChange={(checked) => set({ isActive: !!checked })} />
              <Label htmlFor="isActive" className="cursor-pointer font-normal">เปิดใช้งาน</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="isFeatured" checked={values.isFeatured} disabled={submitting} onCheckedChange={(checked) => set({ isFeatured: !!checked })} />
              <Label htmlFor="isFeatured" className="cursor-pointer font-normal">โพสต์แนะนำ</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : editing ? (
                "อัพเดท"
              ) : (
                "สร้าง"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
