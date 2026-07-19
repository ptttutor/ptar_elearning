"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DAY_MS = 24 * 60 * 60 * 1000;

export default function EditAccessModal({ open, enrollment, onCancel, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [endDate, setEndDate] = useState(null);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [accessHours, setAccessHours] = useState("");

  useEffect(() => {
    if (open && enrollment) {
      const resolvedDays = enrollment.accessDuration ?? enrollment.course?.accessDuration ?? 60;
      const enrolledAt = enrollment.enrolledAt ? new Date(enrollment.enrolledAt) : new Date();
      // Only prefill the picker with a computed date when this enrollment has
      // its own override — otherwise leave it blank so "ใช้ค่าเริ่มต้นของคอร์ส"
      // stays visually true until the admin actively picks a date.
      setEndDate(
        enrollment.accessDuration != null
          ? new Date(enrolledAt.getTime() + resolvedDays * DAY_MS)
          : null
      );
      setAccessHours(enrollment.accessHours != null ? String(enrollment.accessHours) : "");
    }
  }, [open, enrollment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const enrolledAt = enrollment?.enrolledAt ? new Date(enrollment.enrolledAt) : new Date();
      enrolledAt.setHours(0, 0, 0, 0);
      const accessDuration = endDate
        ? Math.max(1, Math.round((new Date(endDate).setHours(0, 0, 0, 0) - enrolledAt.getTime()) / DAY_MS))
        : null;

      await onSubmit({
        accessDuration,
        accessHours: accessHours ? Number(accessHours) : null,
      });
    } finally {
      setLoading(false);
    }
  };

  const resolvedDefaultEndDate = enrollment
    ? new Date(
        (enrollment.enrolledAt ? new Date(enrollment.enrolledAt) : new Date()).getTime() +
          (enrollment.course?.accessDuration ?? 60) * DAY_MS
      )
    : null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>แก้ไขระยะเวลาเรียนสำหรับผู้ใช้นี้</DialogTitle>
        </DialogHeader>

        {enrollment && (
          <div className="-mt-2 mb-2 text-sm">
            <div className="text-gray-500">คอร์ส:</div>
            <div className="font-semibold text-gray-900">{enrollment.course?.title}</div>
            {resolvedDefaultEndDate && (
              <div className="text-xs text-gray-400">
                วันสิ้นสุดเริ่มต้นของคอร์ส (ถ้าไม่กำหนดเอง):{" "}
                {format(resolvedDefaultEndDate, "d MMM yyyy", { locale: th })}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>วันที่สิ้นสุดการเรียน (เว้นว่าง = ใช้ค่าเริ่มต้นของคอร์ส)</Label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "d MMM yyyy", { locale: th }) : "เลือกวันที่"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setDatePopoverOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accessHours">จำนวนชั่วโมงที่เรียนได้ (เว้นว่าง = ใช้ค่าเริ่มต้นของคอร์ส)</Label>
            <Input
              id="accessHours"
              type="number"
              min={1}
              placeholder="เช่น 120"
              value={accessHours}
              onChange={(e) => setAccessHours(e.target.value)}
            />
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
              ) : (
                "บันทึก"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
