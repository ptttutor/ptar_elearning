"use client";
import { useState, useEffect } from "react";
import { FileText, Link as LinkIcon, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CONTENT_TYPE_OPTIONS = [
  { value: "VIDEO", label: "วิดีโอ" },
  { value: "PDF", label: "PDF" },
  { value: "LINK", label: "ลิงก์" },
  { value: "QUIZ", label: "Quiz" },
  { value: "ASSIGNMENT", label: "Assignment" },
];

const EMPTY_FORM = { title: "", contentType: "VIDEO", contentUrl: "", order: 1 };

export default function ContentModal({ open, editing, nextOrder, onCancel, onSubmit, submitting = false }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (editing) {
        setValues({
          title: editing.title || "",
          contentType: editing.contentType || "VIDEO",
          contentUrl: editing.contentUrl || "",
          order: editing.order ?? 1,
        });
      } else {
        setValues({ ...EMPTY_FORM, order: nextOrder ?? 1 });
      }
      setErrors({});
    }
  }, [open, editing, nextOrder]);

  const validate = () => {
    const next = {};
    if (!values.title.trim()) next.title = "กรุณากรอกชื่อเนื้อหา";
    if (!values.contentType) next.contentType = "กรุณาเลือกประเภทเนื้อหา";
    if (!values.contentUrl.trim()) next.contentUrl = "กรุณากรอก URL หรือไฟล์";
    if (!values.order || Number(values.order) < 1) next.order = "ลำดับต้องมากกว่า 0";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: values.title.trim(),
      contentType: values.contentType,
      contentUrl: values.contentUrl.trim(),
      order: Number(values.order),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขเนื้อหา" : "สร้างเนื้อหาใหม่"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">ชื่อเนื้อหา</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="title"
                placeholder="ใส่ชื่อเนื้อหา"
                value={values.title}
                onChange={(e) => setValues((p) => ({ ...p, title: e.target.value }))}
                className="pl-9"
              />
            </div>
            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>ประเภท</Label>
            <Select value={values.contentType} onValueChange={(v) => setValues((p) => ({ ...p, contentType: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกประเภทเนื้อหา" />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.contentType && <p className="text-xs text-red-600">{errors.contentType}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contentUrl">URL/ไฟล์</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="contentUrl"
                placeholder="ใส่ URL หรือ path ของไฟล์"
                value={values.contentUrl}
                onChange={(e) => setValues((p) => ({ ...p, contentUrl: e.target.value }))}
                className="pl-9"
              />
            </div>
            {errors.contentUrl && <p className="text-xs text-red-600">{errors.contentUrl}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="order">ลำดับ</Label>
            <Input
              id="order"
              type="number"
              min={1}
              placeholder="ลำดับของเนื้อหา"
              value={values.order}
              onChange={(e) => setValues((p) => ({ ...p, order: e.target.value }))}
            />
            {errors.order && <p className="text-xs text-red-600">{errors.order}</p>}
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
