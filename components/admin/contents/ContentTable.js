"use client";
import {
  FileText,
  Edit,
  Trash2,
  PlayCircle,
  FileType,
  Link as LinkIcon,
  HelpCircle,
  File,
  ListOrdered,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AdminPagination from "@/components/admin/shared/AdminPagination";

const CONTENT_TYPE_META = {
  VIDEO: { icon: PlayCircle, label: "วิดีโอ", className: "border-red-200 bg-red-50 text-red-700" },
  PDF: { icon: FileType, label: "PDF", className: "border-orange-200 bg-orange-50 text-orange-700" },
  LINK: { icon: LinkIcon, label: "ลิงก์", className: "border-blue-200 bg-blue-50 text-blue-700" },
  QUIZ: { icon: HelpCircle, label: "Quiz", className: "border-green-200 bg-green-50 text-green-700" },
  ASSIGNMENT: { icon: File, label: "Assignment", className: "border-purple-200 bg-purple-50 text-purple-700" },
};

function getContentTypeMeta(type) {
  return CONTENT_TYPE_META[type] || { icon: FileText, label: type, className: "border-gray-200 bg-gray-50 text-gray-600" };
}

// Draggable handle — same interaction surface as before (native pointer
// events via {...listeners}), just restyled.
function DragHandle(props) {
  return (
    <div
      {...props}
      title="คลิกและลากเพื่อเรียงลำดับ"
      className="flex min-h-8 min-w-8 cursor-grab select-none items-center justify-center rounded-md border-2 border-blue-500 bg-blue-50 p-2 transition-all hover:scale-110 hover:bg-blue-500 hover:shadow-md active:cursor-grabbing [&:hover_svg]:text-white"
      style={{ touchAction: "none" }}
    >
      <GripVertical className="h-4 w-4 text-blue-600" />
    </div>
  );
}

function DragOverlayRow({ item }) {
  if (!item) return null;
  const meta = getContentTypeMeta(item.contentType);
  return (
    <div className="flex min-w-[300px] items-center rounded-md border border-gray-200 bg-white p-3 shadow-lg">
      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md border-2 border-blue-500 bg-blue-500">
        <GripVertical className="h-4 w-4 text-white" />
      </div>
      <div>
        <div className="font-semibold text-gray-900">{item.title}</div>
        <Badge variant="outline" className={`mt-1 ${meta.className}`}>
          {meta.label}
        </Badge>
      </div>
    </div>
  );
}

function SortableContentRow({ content, onEdit, onDelete, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: content.id,
  });
  const meta = getContentTypeMeta(content.contentType);
  const TypeIcon = meta.icon;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "#f9fafb" : undefined,
    position: "relative",
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-16 text-center">
        <DragHandle {...listeners} {...attributes} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <FileText className="h-4 w-4 text-blue-600" />
          {content.title}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`inline-flex items-center gap-1 ${meta.className}`}>
          <TypeIcon className="h-3 w-3" />
          {meta.label}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[220px]">
        <span className="block truncate text-sm text-gray-600" title={content.contentUrl}>
          {content.contentUrl}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <ListOrdered className="h-3.5 w-3.5 text-gray-400" />
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
            {content.order}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => onEdit(content)} disabled={disabled}>
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>แก้ไข</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onDelete(content)} disabled={disabled}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ลบ</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function ContentTable({
  contents, // filtered contents for display
  allContents, // all contents for drag & drop
  loading,
  activeId,
  sensors,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragCancel,
  disabled = false,
  pagination,
  onPageChange,
}) {
  const items = allContents || contents;
  const activeItem = items.find((item) => item.id === activeId);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการเนื้อหา</h3>
          <Badge variant="secondary">{items.length} รายการ</Badge>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>ชื่อเนื้อหา</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>URL/ไฟล์</TableHead>
                  <TableHead>ลำดับ</TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400">
                      ยังไม่มีเนื้อหาใน Chapter นี้
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                    {items.map((content) => (
                      <SortableContentRow
                        key={content.id}
                        content={content}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        disabled={disabled}
                      />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </Table>
          </div>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: "0.5" } },
              }),
            }}
          >
            {activeId ? <DragOverlayRow item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>

        {pagination && pagination.totalPages > 1 && (
          <AdminPagination
            current={pagination.page}
            total={pagination.totalPages}
            onPageChange={onPageChange}
            className="mt-4"
          />
        )}
      </div>
    </TooltipProvider>
  );
}
