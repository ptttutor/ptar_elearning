import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPaginationRange } from "@/lib/get-pagination-range";

/**
 * Canonical admin table pagination — truncated page-number list (via
 * getPaginationRange, so it never renders one button per page and overflows
 * the screen once a section has enough rows) + Prev/Next. Pulled out of
 * UserTable.js so every admin list page wires pagination the same way.
 *
 * Renders nothing when there's only one page.
 */
export default function AdminPagination({ current, total, onPageChange, className }) {
  if (total <= 1) return null;

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.max(1, current - 1));
            }}
          />
        </PaginationItem>
        {getPaginationRange(current, total).map((p, i) =>
          p === "..." ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={current === p}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(p);
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.min(total, current + 1));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
