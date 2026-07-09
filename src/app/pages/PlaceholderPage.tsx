import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        <p className="text-sm text-muted-foreground">This module ships in a later phase.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="rounded-full bg-accent/20 p-3 text-accent-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Coming next: full CRUD, tables with search/filter/pagination, live charts and exports.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}