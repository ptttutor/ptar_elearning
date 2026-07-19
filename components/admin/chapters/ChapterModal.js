"use client";
import { useState, useEffect } from "react";
import { BookOpen, Loader2 } from "lucide-react";
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

const EMPTY_FORM = { title: "", order: 1 };

export default function ChapterModal({ open, editing, nextOrder, onCancel, onSubmit, submitting = false }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (editing) {
        setValues({ title: editing.title || "", order: editing.order ?? 1 });
      } else {
        setValues({ title: "", order: nextOrder ?? 1 });
      }
      setErrors({});
    }
  }, [open, editing, nextOrder]);

  const validate = () => {
    const next = {};
    if (!values.title.trim()) next.title = "กรุณากรอกชื่อ Chapter";
    if (!values.order || Number(values.order) < 1) next.order = "ลำดับต้องมากกว่า 0";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ title: values.title.trim(), order: Number(values.order) });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไข Chapter" : "สร้าง Chapter ใหม่"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">ชื่อ Chapter</Label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="title"
                placeholder="ใส่ชื่อ Chapter"
                value={values.title}
                onChange={(e) => setValues((p) => ({ ...p, title: e.target.value }))}
                className="pl-9"
              />
            </div>
            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="order">ลำดับ</Label>
            <Input
              id="order"
              type="number"
              min={1}
              placeholder="ลำดับของ Chapter"
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
