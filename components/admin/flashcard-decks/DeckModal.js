"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getSubjectOptions, getGradeLevelOptions } from "@/lib/constants";
import { fetchMockTopicsForSubject } from "@/hooks/admin/useMockTopics";

const EMPTY_FORM = {
  title: "",
  description: "",
  subject: "",
  gradeLevel: "none",
  topicId: "none",
  coverImageUrl: "",
  isActive: true,
};

async function uploadFile(file, type) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  const res = await fetch("/api/upload-blob", { method: "POST", body: formData });
  const result = await res.json();
  if (!result.success) throw new Error(result.error || "Upload failed");
  return result.data.url;
}

export default function DeckModal({ open, editing, onCancel, onSubmit }) {
  const { toast } = useToast();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [topics, setTopics] = useState([]);
  const fileInputRef = useRef(null);

  const subjectOptions = getSubjectOptions();
  const gradeLevelOptions = getGradeLevelOptions();

  useEffect(() => {
    if (!open) return;
    setValues(
      editing
        ? {
            title: editing.title,
            description: editing.description || "",
            subject: editing.subject,
            gradeLevel: editing.gradeLevel || "none",
            topicId: editing.topicId || "none",
            coverImageUrl: editing.coverImageUrl || "",
            isActive: editing.isActive,
          }
        : EMPTY_FORM
    );
    setErrors({});
  }, [open, editing]);

  // หัวข้อ (MockTopic) ผูกกับวิชา — โหลดใหม่ทุกครั้งที่เปลี่ยนวิชาในฟอร์ม
  useEffect(() => {
    if (!open || !values.subject) {
      setTopics([]);
      return;
    }
    fetchMockTopicsForSubject(values.subject).then(setTopics);
  }, [open, values.subject]);

  const handleSubjectChange = (v) => {
    setValues((p) => ({ ...p, subject: v, topicId: "none" }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "flashcard-image");
      setValues((p) => ({ ...p, coverImageUrl: url }));
      toast({ title: "อัพโหลดรูปปกสำเร็จ" });
    } catch (error) {
      toast({ variant: "destructive", title: `อัพโหลดไม่สำเร็จ: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const next = {};
    if (!values.title.trim()) next.title = "กรุณากรอกชื่อชุด";
    if (!values.subject) next.subject = "กรุณาเลือกวิชา";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim() || null,
        subject: values.subject,
        gradeLevel: values.gradeLevel === "none" ? null : values.gradeLevel,
        topicId: values.topicId === "none" ? null : values.topicId,
        coverImageUrl: values.coverImageUrl || null,
        isActive: values.isActive,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขชุดแฟลชการ์ด" : "สร้างชุดแฟลชการ์ดใหม่"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">ชื่อชุด</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => setValues((p) => ({ ...p, title: e.target.value }))}
              placeholder="เช่น กฎการเคลื่อนที่ของนิวตัน"
            />
            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">รายละเอียด (ไม่บังคับ)</Label>
            <Textarea
              id="description"
              rows={2}
              value={values.description}
              onChange={(e) => setValues((p) => ({ ...p, description: e.target.value }))}
              placeholder="คำอธิบายสั้น ๆ เกี่ยวกับชุดนี้"
            />
          </div>

          <div className="space-y-1.5">
            <Label>รูปปก (ไม่บังคับ)</Label>
            <div className="flex items-center gap-3">
              {values.coverImageUrl && (
                <div className="relative">
                  <img src={values.coverImageUrl} alt="Cover" className="h-16 w-24 rounded-md border object-cover" />
                  <button
                    type="button"
                    onClick={() => setValues((p) => ({ ...p, coverImageUrl: "" }))}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                {uploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                {values.coverImageUrl ? "เปลี่ยนรูป" : "อัพโหลดรูป"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>วิชา</Label>
              <Select value={values.subject} onValueChange={handleSubjectChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกวิชา" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject && <p className="text-xs text-red-600">{errors.subject}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>ระดับชั้น (ไม่บังคับ)</Label>
              <Select value={values.gradeLevel} onValueChange={(v) => setValues((p) => ({ ...p, gradeLevel: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ไม่ระบุ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ไม่ระบุ</SelectItem>
                  {gradeLevelOptions.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>หัวข้อที่ผูก (ไม่บังคับ — ใช้แนะนำชุดนี้จากผลสอบข้อสอบจำลอง)</Label>
            <Select value={values.topicId} onValueChange={(v) => setValues((p) => ({ ...p, topicId: v }))} disabled={!values.subject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="ไม่ระบุหัวข้อ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ไม่ระบุหัวข้อ</SelectItem>
                {topics.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {values.subject && topics.length === 0 && (
              <p className="text-xs text-gray-400">ไม่มีหัวข้อสำหรับวิชานี้ — เพิ่มได้ที่หน้า &quot;หัวข้อข้อสอบจำลอง&quot;</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={values.isActive} onCheckedChange={(v) => setValues((p) => ({ ...p, isActive: v }))} />
            <Label className="!mt-0">เปิดใช้งาน (นักเรียนมองเห็นชุดนี้)</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : editing ? (
                "บันทึกการแก้ไข"
              ) : (
                "สร้างชุด"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
