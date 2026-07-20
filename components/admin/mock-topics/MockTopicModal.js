"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSubjectOptions } from "@/lib/constants";

const EMPTY_FORM = { subject: "", name: "" };

export default function MockTopicModal({ open, editing, onCancel, onSubmit }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const subjectOptions = getSubjectOptions();

  useEffect(() => {
    if (open) {
      setValues(editing ? { subject: editing.subject, name: editing.name } : EMPTY_FORM);
      setErrors({});
    }
  }, [open, editing]);

  const validate = () => {
    const next = {};
    if (!values.subject) next.subject = "กรุณาเลือกวิชา";
    if (!values.name || !values.name.trim()) next.name = "กรุณากรอกชื่อหัวข้อ";
    else if (values.name.length > 100) next.name = "ชื่อหัวข้อต้องไม่เกิน 100 ตัวอักษร";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขหัวข้อ" : "สร้างหัวข้อใหม่"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>วิชา</Label>
            <Select value={values.subject} onValueChange={(v) => setValues((p) => ({ ...p, subject: v }))}>
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
            <Label htmlFor="name">ชื่อหัวข้อ</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
              placeholder="เช่น กลศาสตร์, ไฟฟ้า, สมการกำลังสอง"
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
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
                "สร้างหัวข้อ"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
