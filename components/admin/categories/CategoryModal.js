"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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

const EMPTY_FORM = { name: "", description: "" };

export default function CategoryModal({ open, editing, onCancel, onSubmit, submitting = false }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setValues(editing ? { name: editing.name || "", description: editing.description || "" } : EMPTY_FORM);
      setErrors({});
    }
  }, [open, editing]);

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "กรุณากรอกชื่อหมวดหมู่";
    else if (values.name.trim().length < 2) next.name = "ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร";
    else if (values.name.trim().length > 100) next.name = "ชื่อหมวดหมู่ต้องไม่เกิน 100 ตัวอักษร";
    if (values.description && values.description.length > 500) next.description = "รายละเอียดต้องไม่เกิน 500 ตัวอักษร";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: values.name.trim(), description: values.description.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขหมวดหมู่" : "สร้างหมวดหมู่ใหม่"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">ชื่อหมวดหมู่</Label>
            <Input
              id="name"
              placeholder="ใส่ชื่อหมวดหมู่"
              value={values.name}
              disabled={submitting}
              onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="ใส่รายละเอียดหมวดหมู่ (ถ้ามี)"
              value={values.description}
              disabled={submitting}
              onChange={(e) => setValues((p) => ({ ...p, description: e.target.value }))}
            />
            {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
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
