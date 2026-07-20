"use client";
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getSubjectOptions, getGradeLevelOptions } from "@/lib/constants";

const EMPTY_FORM = {
  title: "",
  description: "",
  courseId: null,
  subject: "",
  gradeLevel: "",
  timeLimit: "",
  passingMarks: "0",
  attemptsAllowed: "1",
  allowPracticeMode: true,
  allowRealMode: true,
  practiceUnlockCost: "1",
  isActive: true,
};

export default function MockExamModal({ open, editing, onCancel, onSubmit }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseComboOpen, setCourseComboOpen] = useState(false);

  const subjectOptions = getSubjectOptions();
  const gradeLevelOptions = getGradeLevelOptions();

  useEffect(() => {
    if (!open) return;

    setCoursesLoading(true);
    fetch("/api/admin/courses?pageSize=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCourses(data.data || []);
      })
      .catch((err) => console.error("Failed to load courses:", err))
      .finally(() => setCoursesLoading(false));

    if (editing) {
      setValues({
        title: editing.title || "",
        description: editing.description || "",
        courseId: editing.courseId || null,
        subject: editing.subject || "",
        gradeLevel: editing.gradeLevel || "",
        timeLimit: editing.timeLimit != null ? String(editing.timeLimit) : "",
        passingMarks: String(editing.passingMarks ?? 0),
        attemptsAllowed: String(editing.attemptsAllowed ?? 1),
        allowPracticeMode: editing.allowPracticeMode ?? true,
        allowRealMode: editing.allowRealMode ?? true,
        practiceUnlockCost: String(editing.practiceUnlockCost ?? 1),
        isActive: editing.isActive ?? true,
      });
      if (editing.course) {
        setCourses((prev) => (prev.some((c) => c.id === editing.course.id) ? prev : [editing.course, ...prev]));
      }
    } else {
      setValues(EMPTY_FORM);
    }
    setErrors({});
  }, [open, editing]);

  const set = (patch) => setValues((prev) => ({ ...prev, ...patch }));

  const validate = () => {
    const next = {};
    if (!values.title.trim()) next.title = "กรุณากรอกชื่อข้อสอบ";
    if (!values.subject) next.subject = "กรุณาเลือกวิชา";
    if (!values.allowPracticeMode && !values.allowRealMode) {
      next.modes = "ต้องเปิดใช้งานอย่างน้อยหนึ่งโหมด (ฝึกฝน หรือ สอบจริง)";
    }
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
        courseId: values.courseId,
        subject: values.subject,
        gradeLevel: values.gradeLevel || null,
        timeLimit: values.timeLimit === "" ? null : Number(values.timeLimit),
        passingMarks: Number(values.passingMarks) || 0,
        attemptsAllowed: Number(values.attemptsAllowed) || 1,
        allowPracticeMode: values.allowPracticeMode,
        allowRealMode: values.allowRealMode,
        practiceUnlockCost: Number(values.practiceUnlockCost) || 1,
        isActive: values.isActive,
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === values.courseId);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขข้อสอบจำลอง" : "สร้างข้อสอบจำลองใหม่"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">ชื่อข้อสอบจำลอง</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="เช่น ข้อสอบจำลอง กลศาสตร์และไฟฟ้า ชุดที่ 1"
            />
            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">คำอธิบาย</Label>
            <Textarea
              id="description"
              rows={3}
              value={values.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับข้อสอบนี้"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>วิชา</Label>
              <Select value={values.subject} onValueChange={(v) => set({ subject: v })}>
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
              <Select value={values.gradeLevel || "none"} onValueChange={(v) => set({ gradeLevel: v === "none" ? "" : v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ทุกระดับชั้น" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ทุกระดับชั้น</SelectItem>
                  {gradeLevelOptions.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>เวลาจำกัด (นาที)</Label>
              <Input
                type="number"
                min={0}
                value={values.timeLimit}
                onChange={(e) => set({ timeLimit: e.target.value })}
                placeholder="เว้นว่าง = ไม่จำกัด"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>ผูกกับคอร์ส (ไม่บังคับ)</Label>
            <Popover open={courseComboOpen} onOpenChange={setCourseComboOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" role="combobox" className="w-full justify-between font-normal">
                  {selectedCourse ? selectedCourse.title : coursesLoading ? "กำลังโหลด..." : "ไม่ผูกกับคอร์ส"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="ค้นหาคอร์ส..." />
                  <CommandList>
                    <CommandEmpty>{coursesLoading ? "กำลังโหลด..." : "ไม่พบคอร์ส"}</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="__none__"
                        onSelect={() => {
                          set({ courseId: null });
                          setCourseComboOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", !values.courseId ? "opacity-100" : "opacity-0")} />
                        ไม่ผูกกับคอร์ส
                      </CommandItem>
                      {courses.map((course) => (
                        <CommandItem
                          key={course.id}
                          value={course.title}
                          onSelect={() => {
                            set({ courseId: course.id });
                            setCourseComboOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", values.courseId === course.id ? "opacity-100" : "opacity-0")} />
                          {course.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>คะแนนผ่าน</Label>
              <Input type="number" min={0} value={values.passingMarks} onChange={(e) => set({ passingMarks: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>จำนวนครั้งที่สอบจริงได้</Label>
              <Input type="number" min={1} value={values.attemptsAllowed} onChange={(e) => set({ attemptsAllowed: e.target.value })} />
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">โหมดการทำข้อสอบ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="text-sm font-medium">โหมดฝึกฝน</div>
                    <div className="text-xs text-gray-500">ไม่จับเวลา ปลดล็อคทีละข้อด้วย token</div>
                  </div>
                  <Switch checked={values.allowPracticeMode} onCheckedChange={(checked) => set({ allowPracticeMode: checked })} />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="text-sm font-medium">โหมดสอบจริง</div>
                    <div className="text-xs text-gray-500">จับเวลา จำกัดจำนวนครั้ง</div>
                  </div>
                  <Switch checked={values.allowRealMode} onCheckedChange={(checked) => set({ allowRealMode: checked })} />
                </div>
              </div>

              {errors.modes && <p className="text-xs text-red-600">{errors.modes}</p>}

              {values.allowPracticeMode && (
                <div className="space-y-1.5">
                  <Label>Token ที่ใช้ปลดล็อค 1 ข้อ</Label>
                  <Input
                    type="number"
                    min={1}
                    value={values.practiceUnlockCost}
                    onChange={(e) => set({ practiceUnlockCost: e.target.value })}
                    className="max-w-[200px]"
                  />
                  <p className="text-xs text-gray-400">
                    Token เป็นยอดรวมของผู้เรียนแต่ละคน ใช้ร่วมกันได้ทุกข้อสอบจำลอง ไม่ได้แจกใหม่แยกตามข้อสอบ
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between rounded-md border p-3">
            <Label className="mb-0">เปิดใช้งาน</Label>
            <Switch checked={values.isActive} onCheckedChange={(checked) => set({ isActive: checked })} />
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
                "สร้างข้อสอบจำลอง"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
