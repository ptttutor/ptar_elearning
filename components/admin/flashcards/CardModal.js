"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ANSWER_MODES = [
  { value: "SELF_GRADE", label: "พลิกเอง (ให้คะแนนตัวเอง)" },
  { value: "MULTIPLE_CHOICE", label: "เลือกตอบ (ก ข ค ง)" },
  { value: "TYPED", label: "พิมพ์คำตอบ" },
];

const EMPTY_OPTIONS = [
  { id: 1, text: "", isCorrect: false },
  { id: 2, text: "", isCorrect: false },
];

async function uploadFile(file, type) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  const res = await fetch("/api/upload-blob", { method: "POST", body: formData });
  const result = await res.json();
  if (!result.success) throw new Error(result.error || "Upload failed");
  return result.data.url;
}

function ImageField({ label, url, uploading, onUpload, onRemove }) {
  const inputRef = useRef(null);
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {url && (
          <div className="relative">
            <img src={url} alt="" className="h-16 w-24 rounded-md border object-cover" />
            <button
              type="button"
              onClick={onRemove}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
          {url ? "เปลี่ยนรูป" : "แนบรูป"}
        </Button>
      </div>
    </div>
  );
}

export default function CardModal({ open, editing, onCancel, onSubmit }) {
  const { toast } = useToast();

  const [front, setFront] = useState("");
  const [frontImage, setFrontImage] = useState("");
  const [back, setBack] = useState("");
  const [backImage, setBackImage] = useState("");
  const [hint, setHint] = useState("");
  const [answerMode, setAnswerMode] = useState("SELF_GRADE");
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [acceptedAnswers, setAcceptedAnswers] = useState([""]);
  const [numericTolerance, setNumericTolerance] = useState("");

  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const resetLocalState = () => {
    setFront("");
    setFrontImage("");
    setBack("");
    setBackImage("");
    setHint("");
    setAnswerMode("SELF_GRADE");
    setOptions(EMPTY_OPTIONS);
    setAcceptedAnswers([""]);
    setNumericTolerance("");
    setErrors({});
  };

  useEffect(() => {
    if (!open) return;

    if (editing) {
      setFront(editing.front || "");
      setFrontImage(editing.frontImage || "");
      setBack(editing.back || "");
      setBackImage(editing.backImage || "");
      setHint(editing.hint || "");
      setAnswerMode(editing.answerMode || "SELF_GRADE");
      setNumericTolerance(editing.numericTolerance != null ? String(editing.numericTolerance) : "");
      setAcceptedAnswers(editing.acceptedAnswers?.length ? editing.acceptedAnswers : [""]);
      setOptions(
        editing.options?.length
          ? editing.options.map((opt, i) => ({ id: i + 1, text: opt.optionText, isCorrect: opt.isCorrect }))
          : EMPTY_OPTIONS
      );
      setErrors({});
    } else {
      resetLocalState();
    }
  }, [open, editing]);

  const addOption = () => {
    const newId = Math.max(...options.map((o) => o.id)) + 1;
    setOptions([...options, { id: newId, text: "", isCorrect: false }]);
  };
  const removeOption = (id) => {
    if (options.length > 2) setOptions(options.filter((o) => o.id !== id));
  };
  const updateOptionText = (id, text) => setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  const toggleCorrect = (id) => setOptions(options.map((o) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)));

  const addAcceptedAnswer = () => setAcceptedAnswers([...acceptedAnswers, ""]);
  const removeAcceptedAnswer = (i) => setAcceptedAnswers(acceptedAnswers.filter((_, idx) => idx !== i));
  const updateAcceptedAnswer = (i, v) => setAcceptedAnswers(acceptedAnswers.map((a, idx) => (idx === i ? v : a)));

  const handleFrontImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingFront(true);
    try {
      setFrontImage(await uploadFile(file, "flashcard-image"));
    } catch (error) {
      toast({ variant: "destructive", title: `อัพโหลดไม่สำเร็จ: ${error.message}` });
    } finally {
      setUploadingFront(false);
    }
  };

  const handleBackImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingBack(true);
    try {
      setBackImage(await uploadFile(file, "flashcard-image"));
    } catch (error) {
      toast({ variant: "destructive", title: `อัพโหลดไม่สำเร็จ: ${error.message}` });
    } finally {
      setUploadingBack(false);
    }
  };

  const validate = () => {
    const next = {};
    if (!front.trim()) next.front = "กรุณากรอกคำถาม (ด้านหน้าการ์ด)";
    if (!back.trim()) next.back = "กรุณากรอกคำตอบ (ด้านหลังการ์ด)";

    if (answerMode === "MULTIPLE_CHOICE") {
      const validOptions = options.filter((o) => o.text.trim());
      if (validOptions.length < 2) next.options = "กรุณาเพิ่มตัวเลือกอย่างน้อย 2 ตัวเลือก";
      else if (!validOptions.some((o) => o.isCorrect)) next.options = "กรุณาเลือกคำตอบที่ถูกต้องอย่างน้อย 1 ตัวเลือก";
    } else if (answerMode === "TYPED") {
      if (!acceptedAnswers.some((a) => a.trim())) next.acceptedAnswers = "กรุณากรอกคำตอบที่ยอมรับได้อย่างน้อย 1 แบบ";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        front: front.trim(),
        frontImage: frontImage || null,
        back: back.trim(),
        backImage: backImage || null,
        hint: hint.trim() || null,
        answerMode,
      };

      if (answerMode === "MULTIPLE_CHOICE") {
        payload.options = options
          .filter((o) => o.text.trim())
          .map((o, i) => ({ optionText: o.text.trim(), isCorrect: o.isCorrect, order: i + 1 }));
      } else if (answerMode === "TYPED") {
        payload.acceptedAnswers = acceptedAnswers.map((a) => a.trim()).filter(Boolean);
        payload.numericTolerance = numericTolerance === "" ? null : Number(numericTolerance);
      }

      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขการ์ด" : "สร้างการ์ดใหม่"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="front">คำถาม (ด้านหน้าการ์ด)</Label>
            <Textarea id="front" rows={3} value={front} onChange={(e) => setFront(e.target.value)} placeholder="เช่น กฎข้อที่ 1 ของนิวตันกล่าวว่าอย่างไร" />
            {errors.front && <p className="text-xs text-red-600">{errors.front}</p>}
          </div>
          <ImageField
            label="รูปประกอบคำถาม (ไม่บังคับ)"
            url={frontImage}
            uploading={uploadingFront}
            onUpload={handleFrontImage}
            onRemove={() => setFrontImage("")}
          />

          <div className="space-y-1.5">
            <Label htmlFor="back">คำตอบ (ด้านหลังการ์ด)</Label>
            <Textarea id="back" rows={3} value={back} onChange={(e) => setBack(e.target.value)} placeholder="คำตอบ/คำอธิบายฉบับเต็ม" />
            {errors.back && <p className="text-xs text-red-600">{errors.back}</p>}
          </div>
          <ImageField
            label="รูปประกอบคำตอบ (ไม่บังคับ)"
            url={backImage}
            uploading={uploadingBack}
            onUpload={handleBackImage}
            onRemove={() => setBackImage("")}
          />

          <div className="space-y-1.5">
            <Label htmlFor="hint">คำใบ้ (ไม่บังคับ — แสดงก่อนดูเฉลย)</Label>
            <Input id="hint" value={hint} onChange={(e) => setHint(e.target.value)} placeholder="เช่น กฎความเฉื่อย" />
          </div>

          <div className="space-y-1.5">
            <Label>รูปแบบการตอบ</Label>
            <Select value={answerMode} onValueChange={setAnswerMode}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANSWER_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {answerMode === "MULTIPLE_CHOICE" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">ตัวเลือกคำตอบ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Input placeholder={`ตัวเลือกที่ ${index + 1}`} value={option.text} onChange={(e) => updateOptionText(option.id, e.target.value)} />
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Switch checked={option.isCorrect} onCheckedChange={() => toggleCorrect(option.id)} />
                      <span className="w-8 text-xs text-gray-500">{option.isCorrect ? "ถูก" : "ผิด"}</span>
                    </div>
                    {options.length > 2 && (
                      <Button type="button" variant="ghost" size="icon" className="text-red-600" onClick={() => removeOption(option.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={addOption}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    เพิ่มตัวเลือก
                  </Button>
                )}
                {errors.options && <p className="text-xs text-red-600">{errors.options}</p>}
              </CardContent>
            </Card>
          )}

          {answerMode === "TYPED" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">คำตอบที่ยอมรับได้</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {acceptedAnswers.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input placeholder="เช่น 9.8 หรือ mg sin θ" value={a} onChange={(e) => updateAcceptedAnswer(i, e.target.value)} />
                      {acceptedAnswers.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="text-red-600" onClick={() => removeAcceptedAnswer(i)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={addAcceptedAnswer}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    เพิ่มคำตอบที่ยอมรับได้
                  </Button>
                </div>
                {errors.acceptedAnswers && <p className="text-xs text-red-600">{errors.acceptedAnswers}</p>}

                <div className="space-y-1.5">
                  <Label>ค่าความคลาดเคลื่อนที่ยอมรับได้ (สำหรับคำตอบตัวเลข)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={numericTolerance}
                    onChange={(e) => setNumericTolerance(e.target.value)}
                    placeholder="เว้นว่าง = ต้องพิมพ์ตรงเป๊ะ (ยอมรับตัวสะกดใกล้เคียงเล็กน้อย)"
                  />
                </div>
              </CardContent>
            </Card>
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
                "สร้างการ์ด"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
