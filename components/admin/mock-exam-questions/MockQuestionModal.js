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
import { useToast } from "@/components/ui/use-toast";

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "เลือกตอบ" },
  { value: "TRUE_FALSE", label: "จริง/เท็จ" },
  { value: "SHORT_ANSWER", label: "ตอบสั้น / เติมคำตอบ" },
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

export default function MockQuestionModal({ open, editing, topics, onCancel, onSubmit }) {
  const { toast } = useToast();

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("MULTIPLE_CHOICE");
  const [topicId, setTopicId] = useState("none");
  const [marks, setMarks] = useState("1");
  const [explanation, setExplanation] = useState("");
  const [numericTolerance, setNumericTolerance] = useState("");
  const [shortAnswerText, setShortAnswerText] = useState("");
  const [options, setOptions] = useState(EMPTY_OPTIONS);

  const [questionImage, setQuestionImage] = useState("");
  const [uploadingQuestionImage, setUploadingQuestionImage] = useState(false);
  const [explanationImages, setExplanationImages] = useState([]);
  const [uploadingExplanationImage, setUploadingExplanationImage] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const questionImageInputRef = useRef(null);
  const explanationImageInputRef = useRef(null);

  const resetLocalState = () => {
    setQuestionText("");
    setQuestionType("MULTIPLE_CHOICE");
    setTopicId("none");
    setMarks("1");
    setExplanation("");
    setNumericTolerance("");
    setShortAnswerText("");
    setOptions(EMPTY_OPTIONS);
    setQuestionImage("");
    setExplanationImages([]);
    setErrors({});
  };

  useEffect(() => {
    if (!open) return;

    if (editing) {
      setQuestionText(editing.questionText || "");
      setQuestionType(editing.questionType || "MULTIPLE_CHOICE");
      setTopicId(editing.topicId || "none");
      setMarks(String(editing.marks ?? 1));
      setExplanation(editing.explanation || "");
      setNumericTolerance(editing.numericTolerance != null ? String(editing.numericTolerance) : "");
      setQuestionImage(editing.questionImage || "");
      setExplanationImages(editing.explanationImages || []);

      if (editing.questionType === "SHORT_ANSWER") {
        setShortAnswerText(editing.options?.[0]?.optionText || "");
      } else if (editing.options?.length) {
        setOptions(editing.options.map((opt, i) => ({ id: i + 1, text: opt.optionText, isCorrect: opt.isCorrect })));
      } else {
        setOptions(EMPTY_OPTIONS);
      }
      setErrors({});
    } else {
      resetLocalState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    if (value === "TRUE_FALSE") {
      setOptions([
        { id: 1, text: "จริง", isCorrect: false },
        { id: 2, text: "เท็จ", isCorrect: false },
      ]);
    } else if (value === "MULTIPLE_CHOICE") {
      setOptions(EMPTY_OPTIONS);
    }
  };

  const addOption = () => {
    const newId = Math.max(...options.map((o) => o.id)) + 1;
    setOptions([...options, { id: newId, text: "", isCorrect: false }]);
  };
  const removeOption = (id) => {
    if (options.length > 2) setOptions(options.filter((o) => o.id !== id));
  };
  const updateOptionText = (id, text) => setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  const toggleCorrect = (id) => setOptions(options.map((o) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)));

  const handleQuestionImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingQuestionImage(true);
    try {
      const url = await uploadFile(file, "mock-question-image");
      setQuestionImage(url);
      toast({ title: "อัพโหลดรูปภาพสำเร็จ" });
    } catch (error) {
      toast({ variant: "destructive", title: `อัพโหลดไม่สำเร็จ: ${error.message}` });
    } finally {
      setUploadingQuestionImage(false);
    }
  };

  const handleExplanationImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingExplanationImage(true);
    try {
      const url = await uploadFile(file, "mock-explanation-image");
      setExplanationImages((prev) => [...prev, url]);
      toast({ title: "อัพโหลดรูปเฉลยสำเร็จ" });
    } catch (error) {
      toast({ variant: "destructive", title: `อัพโหลดไม่สำเร็จ: ${error.message}` });
    } finally {
      setUploadingExplanationImage(false);
    }
  };

  const removeExplanationImage = (url) => setExplanationImages((prev) => prev.filter((u) => u !== url));

  const validate = () => {
    const next = {};
    if (!questionText.trim()) next.questionText = "กรุณากรอกคำถาม";

    if (questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE") {
      const validOptions = options.filter((o) => o.text.trim());
      if (validOptions.length < 2) next.options = "กรุณาเพิ่มตัวเลือกอย่างน้อย 2 ตัวเลือก";
      else if (!validOptions.some((o) => o.isCorrect)) next.options = "กรุณาเลือกคำตอบที่ถูกต้องอย่างน้อย 1 ตัวเลือก";
    } else if (questionType === "SHORT_ANSWER" && !shortAnswerText.trim()) {
      next.shortAnswer = "กรุณากรอกคำตอบที่ถูกต้อง";
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
        questionText: questionText.trim(),
        questionImage: questionImage || null,
        questionType,
        topicId: topicId === "none" ? null : topicId,
        marks: Number(marks) || 1,
        explanation: explanation.trim() || null,
        explanationImages,
      };

      if (questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE") {
        payload.options = options
          .filter((o) => o.text.trim())
          .map((o, i) => ({ optionText: o.text.trim(), isCorrect: o.isCorrect, order: i + 1 }));
      } else if (questionType === "SHORT_ANSWER") {
        payload.options = [{ optionText: shortAnswerText.trim(), isCorrect: true, order: 1 }];
        payload.numericTolerance = numericTolerance === "" ? null : Number(numericTolerance);
      }

      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขคำถาม" : "สร้างคำถามใหม่"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="questionText">คำถาม</Label>
            <Textarea
              id="questionText"
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="กรอกคำถามที่ต้องการสอบถาม... (ถ้ามีสมการซับซ้อน ให้แนบเป็นรูปด้านล่างแทน)"
            />
            {errors.questionText && <p className="text-xs text-red-600">{errors.questionText}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>รูปประกอบคำถาม (ไม่บังคับ — สำหรับสมการ/แผนภาพที่พิมพ์ยาก)</Label>
            <div className="flex items-center gap-3">
              {questionImage && (
                <div className="relative">
                  <img src={questionImage} alt="Question" className="h-20 w-28 rounded-md border object-cover" />
                  <button
                    type="button"
                    onClick={() => setQuestionImage("")}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <input ref={questionImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleQuestionImageChange} />
              <Button type="button" variant="outline" size="sm" disabled={uploadingQuestionImage} onClick={() => questionImageInputRef.current?.click()}>
                {uploadingQuestionImage ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                {questionImage ? "เปลี่ยนรูป" : "อัพโหลดรูป"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>ประเภทคำถาม</Label>
              <Select value={questionType} onValueChange={handleQuestionTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกประเภทคำถาม" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>หัวข้อ (สำหรับวิเคราะห์จุดอ่อน)</Label>
              <Select value={topicId} onValueChange={setTopicId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ไม่ระบุหัวข้อ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ไม่ระบุหัวข้อ</SelectItem>
                  {(topics || []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(topics || []).length === 0 && (
                <p className="text-xs text-gray-400">ไม่มีหัวข้อสำหรับวิชานี้ — เพิ่มได้ที่หน้า &quot;หัวข้อข้อสอบจำลอง&quot;</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>คะแนน</Label>
              <Input type="number" min={1} value={marks} onChange={(e) => setMarks(e.target.value)} />
            </div>
          </div>

          {(questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE") && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">ตัวเลือกคำตอบ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Input
                      placeholder={`ตัวเลือกที่ ${index + 1}`}
                      value={option.text}
                      onChange={(e) => updateOptionText(option.id, e.target.value)}
                      disabled={questionType === "TRUE_FALSE"}
                    />
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Switch checked={option.isCorrect} onCheckedChange={() => toggleCorrect(option.id)} />
                      <span className="w-8 text-xs text-gray-500">{option.isCorrect ? "ถูก" : "ผิด"}</span>
                    </div>
                    {questionType === "MULTIPLE_CHOICE" && options.length > 2 && (
                      <Button type="button" variant="ghost" size="icon" className="text-red-600" onClick={() => removeOption(option.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {questionType === "MULTIPLE_CHOICE" && options.length < 6 && (
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={addOption}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    เพิ่มตัวเลือก
                  </Button>
                )}
                {errors.options && <p className="text-xs text-red-600">{errors.options}</p>}
              </CardContent>
            </Card>
          )}

          {questionType === "SHORT_ANSWER" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">คำตอบที่ถูกต้อง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="เช่น 42 หรือ g sin θ"
                  value={shortAnswerText}
                  onChange={(e) => setShortAnswerText(e.target.value)}
                />
                {errors.shortAnswer && <p className="text-xs text-red-600">{errors.shortAnswer}</p>}

                <div className="space-y-1.5">
                  <Label>ค่าความคลาดเคลื่อนที่ยอมรับได้ (สำหรับคำตอบตัวเลข)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={numericTolerance}
                    onChange={(e) => setNumericTolerance(e.target.value)}
                    placeholder="เว้นว่าง = ต้องตรงเป๊ะ"
                  />
                  <p className="text-xs text-gray-400">
                    ถ้าคำตอบเป็นตัวเลข เช่น 3.14 สามารถกำหนดค่าความคลาดเคลื่อนได้ เช่น 0.01
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="explanation">คำอธิบาย/เฉลย (ไม่บังคับ)</Label>
            <Textarea
              id="explanation"
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="คำอธิบายเพิ่มเติมหรือเฉลยคำตอบ..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>รูปเฉลยแบบละเอียด (ไม่บังคับ — เช่น ภาพเฉลยเขียนมือ แนบได้หลายรูป รองรับ GIF เคลื่อนไหว)</Label>
            {explanationImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {explanationImages.map((url) => (
                  <div key={url} className="relative">
                    <img src={url} alt="Explanation" className="h-16 w-16 rounded-md border object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExplanationImage(url)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {explanationImages.length < 5 && (
              <>
                <input
                  ref={explanationImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleExplanationImageChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingExplanationImage}
                  onClick={() => explanationImageInputRef.current?.click()}
                >
                  {uploadingExplanationImage ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                  แนบรูปเฉลย ({explanationImages.length}/5)
                </Button>
              </>
            )}
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
                "สร้างคำถาม"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
