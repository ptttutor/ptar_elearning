"use client";
import { useState, useEffect, useRef } from "react";
import { User as UserIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useToast } from "@/components/ui/use-toast";
import { uploadDiagnostics } from "@/lib/upload-diagnostics";
import InfoBox from "@/components/admin/shared/InfoBox";

const EMPTY_FORM = { name: "", email: "", role: "STUDENT", lineId: "", password: "" };

export default function UserModal({ open, editing, onCancel, onSubmit }) {
  const { toast } = useToast();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      if (editing) {
        setValues({
          name: editing.name || "",
          email: editing.email || "",
          role: editing.role || "STUDENT",
          lineId: editing.lineId || "",
          password: "",
        });
        setImageUrl(editing.image || "");
      } else {
        setValues(EMPTY_FORM);
        setImageUrl("");
      }
      setErrors({});
    }
  }, [open, editing]);

  const setField = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!values.name || values.name.length < 2) next.name = "ชื่อผู้ใช้ต้องมีอย่างน้อย 2 ตัวอักษร";
    if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "กรุณากรอกอีเมลให้ถูกต้อง";
    }
    if (!editing && (!values.password || values.password.length < 6)) {
      next.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({ ...values, image: imageUrl });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น!" });
      return;
    }

    const monitor = uploadDiagnostics.createPerformanceMonitor();
    setUploading(true);
    try {
      monitor.start();
      uploadDiagnostics.logFileInfo(file, "Upload ");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "general");

      const response = await fetch("/api/upload-blob", { method: "POST", body: formData });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      monitor.complete(result.data);
      setImageUrl(result.data.url);

      if (result.data.compressed) {
        const originalSizeMB = (result.data.originalSize / 1024 / 1024).toFixed(2);
        const finalSizeMB = (result.data.size / 1024 / 1024).toFixed(2);
        toast({ title: `อัปโหลดสำเร็จ! บีบอัดจาก ${originalSizeMB}MB เป็น ${finalSizeMB}MB` });
      } else {
        toast({ title: "อัปโหลดสำเร็จ!" });
      }
    } catch (error) {
      console.error("Upload error:", error);
      monitor.error(error);
      toast({ variant: "destructive", title: `การอัปโหลดล้มเหลว: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image */}
          <div className="space-y-1.5">
            <Label>รูปโปรไฟล์</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {imageUrl && <AvatarImage src={imageUrl} alt="" />}
                <AvatarFallback className="bg-blue-500 text-white">
                  <UserIcon className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {uploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูปภาพ"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">ชื่อผู้ใช้</Label>
              <Input id="name" value={values.name} onChange={setField("name")} placeholder="กรอกชื่อผู้ใช้" />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>บทบาท</Label>
              <Select value={values.role} onValueChange={(value) => setValues((p) => ({ ...p, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">นักเรียน</SelectItem>
                  <SelectItem value="INSTRUCTOR">ผู้สอน</SelectItem>
                  <SelectItem value="ADMIN">ผู้ดูแลระบบ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">อีเมล</Label>
            <Input id="email" type="email" value={values.email} onChange={setField("email")} placeholder="กรอกที่อยู่อีเมล" />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lineId">LINE User ID</Label>
            <Input id="lineId" value={values.lineId} onChange={setField("lineId")} placeholder="U1234567890abcdef..." />
          </div>

          {!editing && (
            <div className="space-y-1.5">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                value={values.password}
                onChange={setField("password")}
                placeholder="กรอกรหัสผ่าน"
              />
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>
          )}

          {editing && (
            <InfoBox tone="warning">
              <strong>หมายเหตุ:</strong> การแก้ไขข้อมูลผู้ใช้จะมีผลทันที
            </InfoBox>
          )}

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
                "สร้างผู้ใช้"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
