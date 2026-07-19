"use client";
import { useState, useEffect } from "react";
import { Edit, Truck, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_FORM = { shippingMethod: "PENDING", status: "PENDING", trackingNumber: "", notes: "" };

export default function ShippingModal({ open, onClose, onSubmit, loading, shipment }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (shipment && open) {
      setValues({
        shippingMethod: shipment.shippingMethod || "PENDING",
        status: shipment.status,
        trackingNumber: shipment.trackingNumber || "",
        notes: shipment.notes || "",
      });
      setErrors({});
    }
  }, [shipment, open]);

  const set = (patch) => setValues((p) => ({ ...p, ...patch }));

  const validate = () => {
    const next = {};
    if (!values.shippingMethod) next.shippingMethod = "กรุณาเลือกบริษัทขนส่ง";
    if (!values.status) next.status = "กรุณาเลือกสถานะ";
    if (values.trackingNumber && !/^[A-Za-z0-9-_]*$/.test(values.trackingNumber)) {
      next.trackingNumber = "เลขติดตามต้องเป็นตัวอักษร ตัวเลข หรือ - _ เท่านั้น";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const success = await onSubmit(values);
    if (success) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleCancel()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            อัพเดทการจัดส่ง #{shipment?.orderId?.slice(-8) || "..."}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-gray-400" /> บริษัทขนส่ง
            </Label>
            <Select value={values.shippingMethod} onValueChange={(v) => set({ shippingMethod: v })} disabled={loading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกบริษัทขนส่ง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">รอเลือก</SelectItem>
                <SelectItem value="KERRY">Kerry Express</SelectItem>
                <SelectItem value="THAILAND_POST">ไปรษณีย์ไทย</SelectItem>
                <SelectItem value="JT_EXPRESS">J&T Express</SelectItem>
                <SelectItem value="FLASH_EXPRESS">Flash Express</SelectItem>
                <SelectItem value="NINJA_VAN">Ninja Van</SelectItem>
              </SelectContent>
            </Select>
            {errors.shippingMethod && <p className="text-xs text-red-600">{errors.shippingMethod}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>สถานะการจัดส่ง</Label>
            <Select value={values.status} onValueChange={(v) => set({ status: v })} disabled={loading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">รอดำเนินการ</SelectItem>
                <SelectItem value="PROCESSING">กำลังเตรียม</SelectItem>
                <SelectItem value="SHIPPED">จัดส่งแล้ว</SelectItem>
                <SelectItem value="DELIVERED">ส่งถึงแล้ว</SelectItem>
                <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-red-600">{errors.status}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trackingNumber">เลขติดตาม</Label>
            <Input
              id="trackingNumber"
              placeholder="กรอกเลขติดตาม (หากมี)"
              maxLength={50}
              value={values.trackingNumber}
              disabled={loading}
              onChange={(e) => set({ trackingNumber: e.target.value })}
            />
            {errors.trackingNumber && <p className="text-xs text-red-600">{errors.trackingNumber}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              rows={4}
              maxLength={500}
              placeholder="หมายเหตุเพิ่มเติม (หากมี)"
              value={values.notes}
              disabled={loading}
              onChange={(e) => set({ notes: e.target.value })}
            />
            <div className="text-right text-xs text-gray-400">{values.notes.length}/500</div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              อัพเดท
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
