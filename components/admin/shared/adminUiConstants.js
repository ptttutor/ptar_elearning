// Shared conventions for the admin panel, used across pages/tables/modals/filters
// so every section looks and behaves the same way.

export const ADMIN_PAGE_CONTAINER_STYLE = {
  padding: "24px",
  backgroundColor: "#f5f5f5",
  minHeight: "100vh",
};

export const MODAL_WIDTH = {
  sm: 600, // simple forms (categories, chapters, etc.)
  md: 800, // forms with a Row/Col grid or a nested list (questions, exams)
  lg: 900, // media-heavy forms (ebooks, posts with image upload)
};

export const TABLE_SIZE = "middle";

export const RESET_FILTERS_LABEL = "ล้างตัวกรอง";

export const MODAL_OK_TEXT = {
  create: "สร้าง",
  update: "บันทึกการแก้ไข",
};
export const MODAL_CANCEL_TEXT = "ยกเลิก";
