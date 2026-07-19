"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  BookOpen,
  User as UserIcon,
  Edit,
  Ban,
  Search,
  CalendarIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminPagination from "@/components/admin/shared/AdminPagination";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EditAccessModal from "@/components/admin/users/EditAccessModal";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";
import InfoBox from "@/components/admin/shared/InfoBox";

const GRANT_PAGE_SIZE = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_STYLES = {
  ACTIVE: "border-blue-200 bg-blue-50 text-blue-700",
  COMPLETED: "border-green-200 bg-green-50 text-green-700",
  CANCELED: "border-gray-200 bg-gray-50 text-gray-500",
};
const STATUS_LABELS = { ACTIVE: "กำลังเรียน", COMPLETED: "เรียนจบแล้ว", CANCELED: "ยกเลิกแล้ว" };

export default function UserCoursesPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

  const [courseTableCourses, setCourseTableCourses] = useState([]);
  const [courseTableTotal, setCourseTableTotal] = useState(0);
  const [courseTableLoading, setCourseTableLoading] = useState(true);
  const [coursePage, setCoursePage] = useState(1);
  const [courseSearchInput, setCourseSearchInput] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [knownCourseTitles, setKnownCourseTitles] = useState({});

  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [grantEndDate, setGrantEndDate] = useState(null);
  const [grantDatePopoverOpen, setGrantDatePopoverOpen] = useState(false);
  const [grantAccessHours, setGrantAccessHours] = useState("");
  const [granting, setGranting] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);

  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
      } else {
        toast({ variant: "destructive", title: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้" });
    } finally {
      setUserLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    setEnrollmentsLoading(true);
    try {
      const res = await fetch(`/api/admin/enrollments?userId=${id}`);
      const data = await res.json();
      if (res.ok) {
        setEnrollments(data.enrollments || []);
      } else {
        toast({ variant: "destructive", title: data.error || "ไม่สามารถโหลดคอร์สที่ถืออยู่ได้" });
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการโหลดคอร์สที่ถืออยู่" });
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const fetchCourseTable = async (page, search) => {
    setCourseTableLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(GRANT_PAGE_SIZE),
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/courses?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const list = data.data || [];
        setCourseTableCourses(list);
        setCourseTableTotal(data.pagination?.totalCount || 0);
        setKnownCourseTitles((prev) => {
          const next = { ...prev };
          list.forEach((c) => {
            next[c.id] = c.title;
          });
          return next;
        });
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setCourseTableLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchUser();
    fetchEnrollments();
    fetchCourseTable(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCourseSearch = (e) => {
    e.preventDefault();
    setCourseSearch(courseSearchInput);
    setCoursePage(1);
    fetchCourseTable(1, courseSearchInput);
  };

  const handleCoursePageChange = (page) => {
    setCoursePage(page);
    fetchCourseTable(page, courseSearch);
  };

  const heldCourseIds = useMemo(
    () => new Set(enrollments.map((e) => e.course?.id).filter(Boolean)),
    [enrollments]
  );

  const selectedCourseNames = selectedCourseIds.map((cid) => knownCourseTitles[cid] || cid);

  const handleGrant = async () => {
    if (selectedCourseIds.length === 0) return;
    setGranting(true);
    try {
      // New enrollments get enrolledAt = now server-side, so "now" is the
      // correct reference point for converting the picked end date into days.
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const accessDuration = grantEndDate
        ? Math.max(1, Math.round((new Date(grantEndDate).setHours(0, 0, 0, 0) - today.getTime()) / DAY_MS))
        : null;

      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: id,
          courseIds: selectedCourseIds,
          accessDuration,
          accessHours: grantAccessHours ? Number(grantAccessHours) : null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการเพิ่มคอร์ส" });
        return;
      }

      if (data.granted?.length) {
        toast({ title: `เพิ่มคอร์สสำเร็จ: ${data.granted.join(", ")}` });
      }
      if (data.alreadyEnrolled?.length) {
        toast({ title: `ผู้ใช้มีคอร์สนี้อยู่แล้ว: ${data.alreadyEnrolled.join(", ")}` });
      }

      setSelectedCourseIds([]);
      setGrantEndDate(null);
      setGrantAccessHours("");
      fetchEnrollments();
    } catch (error) {
      console.error("Grant course error:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการเพิ่มคอร์ส" });
    } finally {
      setGranting(false);
    }
  };

  const openEditModal = (enrollment) => {
    setEditingEnrollment(enrollment);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingEnrollment(null);
  };

  const handleEditAccess = async ({ accessDuration, accessHours }) => {
    if (!editingEnrollment?.id) return;
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: editingEnrollment.id,
          accessDuration,
          accessHours,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการแก้ไข" });
        return;
      }

      toast({ title: "บันทึกระยะเวลาเรียนสำเร็จ" });
      closeEditModal();
      fetchEnrollments();
    } catch (error) {
      console.error("Edit access error:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการแก้ไข" });
    }
  };

  const handleCancelEnrollment = async () => {
    if (!cancelTarget) return;
    try {
      const res = await fetch(
        `/api/admin/enrollments?enrollmentId=${encodeURIComponent(cancelTarget.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการยกเลิกคอร์ส" });
        return;
      }

      toast({ title: "ยกเลิกคอร์สสำเร็จ" });
      fetchEnrollments();
    } catch (error) {
      console.error("Cancel enrollment error:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการยกเลิกคอร์ส" });
    } finally {
      setCancelTarget(null);
    }
  };

  const courseTotalPages = Math.max(1, Math.ceil(courseTableTotal / GRANT_PAGE_SIZE));

  return (
    <TooltipProvider delayDuration={200}>
      <AdminPageHeader
        icon={<BookOpen className="h-6 w-6" />}
        title="จัดการคอร์สผู้ใช้"
        subtitle={user && !userLoading ? `${user.name || "ไม่ระบุชื่อ"} (${user.email})` : undefined}
        breadcrumbItems={[
          {
            href: "/admin/users",
            label: (
              <span className="inline-flex items-center gap-1">
                <UserIcon className="h-3.5 w-3.5" />
                จัดการผู้ใช้งาน
              </span>
            ),
          },
          {
            label: (
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                จัดการคอร์สผู้ใช้
              </span>
            ),
          },
        ]}
        onBack={() => router.back()}
      >
        {/* Held courses */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">คอร์สที่ถืออยู่</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>คอร์ส</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>แหล่งที่มา</TableHead>
                  <TableHead>ความคืบหน้า</TableHead>
                  <TableHead>วันที่ลงทะเบียน</TableHead>
                  <TableHead>ระยะเวลาที่เรียนได้</TableHead>
                  <TableHead>วันหมดอายุ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollmentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-400">
                      กำลังโหลด...
                    </TableCell>
                  </TableRow>
                ) : enrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-400">
                      ยังไม่มีคอร์สที่ถืออยู่
                    </TableCell>
                  </TableRow>
                ) : (
                  enrollments.map((record) => {
                    const statusDisplay = STATUS_STYLES[record.status] || STATUS_STYLES.CANCELED;
                    const isOverride = record.accessDuration != null;
                    const resolvedDays = record.accessDuration ?? record.course?.accessDuration ?? 60;
                    const resolvedHours = record.accessHours ?? record.course?.accessHours;
                    const expiresAt = record.enrolledAt
                      ? new Date(new Date(record.enrolledAt).getTime() + resolvedDays * DAY_MS)
                      : null;
                    const isExpired = expiresAt && expiresAt < new Date();
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{record.course?.title || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusDisplay}>
                            {STATUS_LABELS[record.status] || record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.isPurchased ? (
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                              ซื้อปกติ
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                              Admin เพิ่มให้
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{Math.round(record.progress || 0)}%</TableCell>
                        <TableCell className="text-gray-500">
                          {record.enrolledAt ? new Date(record.enrolledAt).toLocaleString("th-TH") : "-"}
                        </TableCell>
                        <TableCell>
                          {resolvedDays} วัน{resolvedHours != null ? ` / ${resolvedHours} ชม.` : ""}
                          {!isOverride && <span className="text-xs text-gray-400"> (ค่าเริ่มต้น)</span>}
                        </TableCell>
                        <TableCell className={isExpired ? "text-red-600" : "text-gray-700"}>
                          {expiresAt ? expiresAt.toLocaleDateString("th-TH") : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => openEditModal(record)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>แก้ไขระยะเวลาเรียน</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600"
                                  onClick={() => setCancelTarget(record)}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>ยกเลิกคอร์สนี้ (ลบออกจากรายการถาวร)</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Grant courses */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">เพิ่มคอร์สให้ผู้ใช้ (ไม่ผ่านการซื้อ)</h3>

          <div className="space-y-4">
            <form onSubmit={handleCourseSearch} className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="ค้นหาคอร์สจากชื่อ..."
                value={courseSearchInput}
                onChange={(e) => setCourseSearchInput(e.target.value)}
                className="pl-9"
              />
            </form>

            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>คอร์ส</TableHead>
                    <TableHead>หมวดหมู่</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseTableLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-400">
                        กำลังโหลด...
                      </TableCell>
                    </TableRow>
                  ) : courseTableCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-400">
                        ไม่พบคอร์ส
                      </TableCell>
                    </TableRow>
                  ) : (
                    courseTableCourses.map((record) => {
                      const alreadyHeld = heldCourseIds.has(record.id);
                      const checked = selectedCourseIds.includes(record.id);
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <Checkbox
                              checked={checked}
                              disabled={alreadyHeld}
                              onCheckedChange={(next) => {
                                setSelectedCourseIds((prev) =>
                                  next ? [...prev, record.id] : prev.filter((cid) => cid !== record.id)
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-2">
                              {record.title}
                              {alreadyHeld && <Badge variant="secondary">ถืออยู่แล้ว</Badge>}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-500">{record.category?.name || "-"}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <AdminPagination
              current={coursePage}
              total={courseTotalPages}
              onPageChange={handleCoursePageChange}
            />

            {selectedCourseIds.length > 0 && (
              <div className="text-xs text-gray-500">
                เลือกไว้ {selectedCourseIds.length} คอร์ส: {selectedCourseNames.join(", ")}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 pl-2"
                  onClick={() => setSelectedCourseIds([])}
                >
                  ล้างที่เลือก
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <div>
                <div className="mb-1 text-xs text-gray-500">
                  วันที่สิ้นสุดการเรียน (เว้นว่าง = ใช้ค่าเริ่มต้นของคอร์ส)
                </div>
                <Popover open={grantDatePopoverOpen} onOpenChange={setGrantDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-[220px] justify-start font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {grantEndDate ? format(grantEndDate, "d MMM yyyy", { locale: th }) : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={grantEndDate}
                      onSelect={(date) => {
                        setGrantEndDate(date);
                        setGrantDatePopoverOpen(false);
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <div className="mb-1 text-xs text-gray-500">
                  จำนวนชั่วโมงที่เรียนได้ (เว้นว่าง = ใช้ค่าเริ่มต้นของคอร์ส)
                </div>
                <Input
                  type="number"
                  min={1}
                  placeholder="เช่น 120"
                  value={grantAccessHours}
                  onChange={(e) => setGrantAccessHours(e.target.value)}
                  className="w-[220px]"
                />
              </div>
            </div>

            <Button onClick={handleGrant} disabled={selectedCourseIds.length === 0 || granting}>
              {granting ? "กำลังเพิ่ม..." : `เพิ่มคอร์สที่เลือก (${selectedCourseIds.length})`}
            </Button>

            <InfoBox tone="warning">
              <strong>หมายเหตุ:</strong> การเพิ่มคอร์สด้วยวิธีนี้จะข้ามขั้นตอนการชำระเงินทั้งหมด
              ผู้ใช้จะได้สิทธิ์เข้าถึงคอร์สทันที
            </InfoBox>
          </div>
        </div>

        <EditAccessModal
          open={editModalOpen}
          enrollment={editingEnrollment}
          onCancel={closeEditModal}
          onSubmit={handleEditAccess}
        />

        <AlertDialog open={!!cancelTarget} onOpenChange={(next) => !next && setCancelTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยกเลิกคอร์สนี้?</AlertDialogTitle>
              <AlertDialogDescription>
                จะลบรายการนี้ออกถาวร รวมถึงความคืบหน้าการเรียน กู้คืนไม่ได้
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ปิด</AlertDialogCancel>
              <Button variant="destructive" onClick={handleCancelEnrollment}>
                ยกเลิกคอร์ส
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminPageHeader>
    </TooltipProvider>
  );
}
