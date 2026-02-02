import { formatNumber, formatDate } from "@/lib/utils";
import { ChevronRight, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface ContentItem {
  id: string;
  title: string;
  date: Date;
  views: number;
  completion: number;
  screenshots: number;
  shares: number;
}

interface ContentTableProps {
  items: ContentItem[];
}

export function ContentTable({ items }: ContentTableProps) {
  return (
    <div className="snap-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-foreground">Content Performance</h3>
        <Button
          variant="ghost"
          disabled={items.length === 0}
          className="text-primary text-sm font-medium flex items-center p-0 h-auto hover:bg-transparent"
        >
          <span>See all</span>
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead>Screenshots</TableHead>
              <TableHead>Shares</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center p-4">
                    <Ghost className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
                    <p className="font-medium text-foreground">No content data available</p>
                    <p className="text-sm text-muted-foreground">Start posting on Snapchat to see your performance here</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-muted rounded flex-shrink-0"></div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatNumber(item.views)}</TableCell>
                  <TableCell>
                    <div className="space-y-1 w-[100px]">
                      <Progress value={item.completion} className="h-2 bg-muted" />
                      <span className="text-xs text-muted-foreground">{item.completion}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatNumber(item.screenshots)}</TableCell>
                  <TableCell className="text-sm">{formatNumber(item.shares)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
