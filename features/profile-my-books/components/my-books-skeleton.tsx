import { Card, CardContent } from "@/components/ui/card"

export function MyBooksSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={`sk-${i}`} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-[2/3] bg-gray-100" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-9 bg-gray-100 rounded w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
