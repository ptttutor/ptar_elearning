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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const toDatetimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const defaultValidFrom = () => toDatetimeLocal(new Date());
const defaultValidUntil = () => toDatetimeLocal(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

const EMPTY_FORM = {
  code: "",
  name: "",
  description: "",
  type: "PERCENTAGE",
  value: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  userUsageLimit: "",
  applicableType: "ALL",
  isActive: true,
  validFrom: defaultValidFrom(),
  validUntil: defaultValidUntil(),
};

export default function CouponModal({ open, onCancel, onSubmit, initialData, title }) {
  const { toast } = useToast();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValues({
          ...EMPTY_FORM,
          ...initialData,
          value: initialData.value ?? "",
          minOrderAmount: initialData.minOrderAmount ?? "",
          maxDiscount: initialData.maxDiscount ?? "",
          usageLimit: initialData.usageLimit ?? "",
          userUsageLimit: initialData.userUsageLimit ?? "",
          validFrom: toDatetimeLocal(initialData.validFrom),
          validUntil: toDatetimeLocal(initialData.validUntil),
        });
      } else {
        setValues(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [open, initialData]);

  const set = (patch) => setValues((p) => ({ ...p, ...patch }));

  const handleTypeChange = (value) => {
    set({ type: value, value: "", maxDiscount: "" });
  };

  const validate = () => {
    const next = {};
    if (!values.code) next.code = "กรุณาใส่รหัสคูปอง";
    else if (values.code.length < 3) next.code = "รหัสคูปองต้องมีอย่างน้อย 3 ตัวอักษร";
    else if (!/^[A-Z0-9]+$/.test(values.code.toUpperCase())) next.code = "รหัสคูปองใช้ได้เฉพาะตัวอักษรและตัวเลขเท่านั้น";

    if (!values.name.trim()) next.name = "กรุณาใส่ชื่อคูปอง";

    if (values.type !== "FREE_SHIPPING") {
      const v = parseFloat(values.value);
      if (values.value === "" || isNaN(v)) next.value = "กรุณาใส่ค่าส่วนลด";
      else if (values.type === "PERCENTAGE" && (v <= 0 || v > 100)) next.value = "เปอร์เซ็นต์ส่วนลดต้องอยู่ระหว่าง 1-100";
      else if (values.type === "FIXED_AMOUNT" && v <= 0) next.value = "จำนวนเงินส่วนลดต้องมากกว่า 0";
    }

    if (!values.applicableType) next.applicableType = "กรุณาเลือกขอบเขตการใช้งาน";
    if (!values.validFrom || !values.validUntil) next.validRange = "กรุณาเลือกช่วงเวลาที่ใช้ได้";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast({ variant: "destructive", title: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      return;
    }
    setLoading(true);
    try {
      const submitData = {
        code: values.code.toUpperCase(),
        name: values.name,
        description: values.description,
        type: values.type,
        value: values.type === "FREE_SHIPPING" ? 0 : parseFloat(values.value),
        minOrderAmount: values.minOrderAmount === "" ? null : parseFloat(values.minOrderAmount),
        maxDiscount: values.maxDiscount === "" ? null : parseFloat(values.maxDiscount),
        usageLimit: values.usageLimit === "" ? null : parseInt(values.usageLimit),
        userUsageLimit: values.userUsageLimit === "" ? null : parseInt(values.userUsageLimit),
        applicableType: values.applicableType,
        isActive: values.isActive,
        validFrom: new Date(values.validFrom).toISOString(),
        validUntil: new Date(values.validUntil).toISOString(),
      };
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="code">รหัสคูปอง</Label>
              <Input
                id="code"
                placeholder="เช่น SAVE20, NEWUSER"
                value={values.code}
                disabled={loading}
                onChange={(e) => set({ code: e.target.value.toUpperCase() })}
                className="uppercase"
              />
              {errors.code && <p className="text-xs text-red-600">{errors.code}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">ชื่อคูปอง</Label>
              <Input id="name" placeholder="เช่น ลด 20% สำหรับสมาชิกใหม่" value={values.name} disabled={loading} onChange={(e) => set({ name: e.target.value })} />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">คำอธิบาย</Label>
            <Textarea id="description" rows={3} placeholder="อธิบายรายละเอียดคูปอง เงื่อนไข และข้อกำหนด" value={values.description || ""} disabled={loading} onChange={(e) => set({ description: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>ประเภทคูปอง</Label>
              <Select value={values.type} onValueChange={handleTypeChange} disabled={loading}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">ส่วนลดเปอร์เซ็นต์ (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">ส่วนลดจำนวนคงที่ (฿)</SelectItem>
                  <SelectItem value="FREE_SHIPPING">ฟรีค่าจัดส่ง</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {values.type !== "FREE_SHIPPING" && (
              <div className="space-y-1.5">
                <Label htmlFor="value">{values.type === "PERCENTAGE" ? "เปอร์เซ็นต์ส่วนลด" : "จำนวนเงินส่วนลด"}</Label>
                <Input
                  id="value"
                  type="number"
                  min={0}
                  max={values.type === "PERCENTAGE" ? 100 : undefined}
                  placeholder={values.type === "PERCENTAGE" ? "20" : "100"}
                  value={values.value}
                  disabled={loading}
                  onChange={(e) => set({ value: e.target.value })}
                />
                {errors.value && <p className="text-xs text-red-600">{errors.value}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="minOrderAmount">ยอดขั้นต่ำ (฿)</Label>
              <Input id="minOrderAmount" type="number" min={0} placeholder="0" value={values.minOrderAmount} disabled={loading} onChange={(e) => set({ minOrderAmount: e.target.value })} />
            </div>
            {values.type === "PERCENTAGE" && (
              <div className="space-y-1.5">
                <Label htmlFor="maxDiscount">ส่วนลดสูงสุด (฿)</Label>
                <Input id="maxDiscount" type="number" min={0} placeholder="ไม่จำกัด" value={values.maxDiscount} disabled={loading} onChange={(e) => set({ maxDiscount: e.target.value })} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="usageLimit">จำกัดจำนวนการใช้งานทั้งหมด</Label>
              <Input id="usageLimit" type="number" min={0} placeholder="ไม่จำกัด" value={values.usageLimit} disabled={loading} onChange={(e) => set({ usageLimit: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="userUsageLimit">จำกัดจำนวนการใช้งานต่อคน</Label>
              <Input id="userUsageLimit" type="number" min={0} placeholder="ไม่จำกัด" value={values.userUsageLimit} disabled={loading} onChange={(e) => set({ userUsageLimit: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>ขอบเขตการใช้งาน</Label>
              <Select value={values.applicableType} onValueChange={(v) => set({ applicableType: v })} disabled={loading}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ทุกสินค้า</SelectItem>
                  <SelectItem value="COURSE_ONLY">คอร์สเท่านั้น</SelectItem>
                  <SelectItem value="EBOOK_ONLY">E-book เท่านั้น</SelectItem>
                  <SelectItem value="CATEGORY">หมวดหมู่ที่กำหนด</SelectItem>
                  <SelectItem value="SPECIFIC_ITEM">สินค้าที่กำหนด</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>สถานะ</Label>
              <div className="flex h-9 items-center gap-2">
                <Switch checked={values.isActive} disabled={loading} onCheckedChange={(checked) => set({ isActive: checked })} />
                <span className="text-sm text-gray-600">{values.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>ช่วงเวลาที่ใช้ได้</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input type="datetime-local" value={values.validFrom} disabled={loading} onChange={(e) => set({ validFrom: e.target.value })} />
              <Input type="datetime-local" value={values.validUntil} disabled={loading} onChange={(e) => set({ validUntil: e.target.value })} />
            </div>
            {errors.validRange && <p className="text-xs text-red-600">{errors.validRange}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
