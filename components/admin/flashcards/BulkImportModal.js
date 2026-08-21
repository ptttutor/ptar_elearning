"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function BulkImportModal({ open, onCancel, onSubmit }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("กรุณาวางข้อมูลที่จะนำเข้า");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit(text);
      setText("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>นำเข้าการ์ดเป็นชุด</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="rounded-md bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
            วางข้อความ 1 บรรทัดต่อ 1 ใบ คั่นระหว่างคำถามกับคำตอบด้วย <b>Tab</b> (คัดลอกจาก Excel/Google
            Sheets 2 คอลัมน์ได้เลย) — รองรับเฉพาะโหมด &quot;พลิกเอง&quot; เท่านั้น การ์ดแบบเลือกตอบ/พิมพ์ตอบต้องเพิ่มทีละใบ
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bulk-text">ข้อมูลที่จะนำเข้า</Label>
            <Textarea
              id="bulk-text"
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"กฎข้อที่ 1 ของนิวตันกล่าวว่าอย่างไร\tวัตถุจะรักษาสภาพหยุดนิ่งหรือเคลื่อนที่คงที่ ถ้าไม่มีแรงลัพธ์กระทำ\nหน่วยของแรงคืออะไร\tนิวตัน (N)"}
              className="font-mono text-xs"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังนำเข้า...
                </>
              ) : (
                "นำเข้าการ์ด"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
