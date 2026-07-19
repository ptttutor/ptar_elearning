"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ArrowRight, Check, ChevronsUpDown, CalendarIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function QuickGrantCourseModal({ open, user, onCancel, onSubmit }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [courseComboOpen, setCourseComboOpen] = useState(false);
  const [endDate, setEndDate] = useState(null);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setCourseId(null);
    setEndDate(null);
    setError("");

    const loadCourses = async () => {
      setCoursesLoading(true);
      try {
        const res = await fetch("/api/admin/courses?pageSize=100");
        const data = await res.json();
        if (data.success) setCourses(data.data || []);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setCoursesLoading(false);
      }
    };

    loadCourses();
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) {
      setError("กรุณาเลือกคอร์ส");
      return;
    }
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const accessDuration = endDate
        ? Math.max(1, Math.round((endDate.setHours(0, 0, 0, 0) - today.getTime()) / 86400000))
        : null;
      await onSubmit(courseId, accessDuration);
    } finally {
      setLoading(false);
    }
  };

  const goToFullPage = () => {
    if (!user?.id) return;
    onCancel();
    router.push(`/admin/users/${user.id}/courses`);
  };

  const selectedCourse = courses.find((c) => c.id === courseId);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>เพิ่มคอร์สให้ผู้ใช้ (ไม่ผ่านการซื้อ)</DialogTitle>
        </DialogHeader>

        {user && (
          <div className="-mt-2 mb-2 text-sm">
            <div className="text-gray-500">ผู้ใช้:</div>
            <div className="font-semibold text-gray-900">{user.name || "ไม่ระบุชื่อ"}</div>
            <div className="text-gray-500">{user.email}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>เลือกคอร์ส</Label>
            <Popover open={courseComboOpen} onOpenChange={setCourseComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                >
                  {selectedCourse ? selectedCourse.title : coursesLoading ? "กำลังโหลด..." : "ค้นหาคอร์ส..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="ค้นหาคอร์ส..." />
                  <CommandList>
                    <CommandEmpty>{coursesLoading ? "กำลังโหลด..." : "ไม่พบคอร์ส"}</CommandEmpty>
                    <CommandGroup>
                      {courses.map((course) => (
                        <CommandItem
                          key={course.id}
                          value={course.title}
                          onSelect={() => {
                            setCourseId(course.id);
                            setError("");
                            setCourseComboOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              courseId === course.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {course.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

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
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="button" variant="link" onClick={goToFullPage} className="h-auto p-0">
            <ArrowRight className="mr-1 h-3.5 w-3.5" />
            จัดการคอร์สแบบเต็มระบบ
          </Button>

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
                "เพิ่มสิทธิ์เข้าถึง"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
