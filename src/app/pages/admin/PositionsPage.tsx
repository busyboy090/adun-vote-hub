import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { electionsApi } from "@/api/elections";
import { positionsApi } from "@/api/positions";
import type { CreatePositionDto, Position } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const blank: CreatePositionDto = { title: "", description: "", electionId: "" };
const ALL_ELECTIONS = "__all_elections";

export function PositionsPage() {
  const client = useQueryClient();
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [form, setForm] = useState<CreatePositionDto>(blank);
  const elections = useQuery({ queryKey: ["elections"], queryFn: electionsApi.list });
  const positions = useQuery({
    queryKey: ["positions", filter],
    queryFn: () => positionsApi.list(filter || undefined),
  });
  const electionNames = new Map(
    (elections.data ?? []).map((election) => [election.id, election.title]),
  );

  const save = useMutation({
    mutationFn: () => (editing ? positionsApi.update(editing.id, form) : positionsApi.create(form)),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["positions"] });
      toast.success(editing ? "Position updated" : "Position created");
      setOpen(false);
    },
  });
  const remove = useMutation({
    mutationFn: positionsApi.remove,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Position deleted");
    },
  });

  function start(position?: Position) {
    setEditing(position ?? null);
    setForm(
      position
        ? {
            title: position.title,
            description: position.description ?? "",
            electionId: position.electionId,
          }
        : { ...blank, electionId: filter },
    );
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Positions</h2>
          <p className="text-sm text-muted-foreground">
            Define the offices contested in each election.
          </p>
        </div>
        <Button onClick={() => start()}>
          <Plus className="mr-2 h-4 w-4" />
          New position
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          <Label htmlFor="election-filter">Election</Label>
          <Select
            value={filter || ALL_ELECTIONS}
            onValueChange={(value) => setFilter(value === ALL_ELECTIONS ? "" : value)}
            disabled={elections.isLoading}
          >
            <SelectTrigger id="election-filter" className="mt-2 h-10 w-full sm:max-w-md">
              <SelectValue placeholder="Filter by election" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ELECTIONS}>All elections</SelectItem>
              {(elections.data ?? []).map((election) => (
                <SelectItem key={election.id} value={election.id}>
                  {election.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {positions.isLoading ? (
        <Skeleton className="h-40" />
      ) : (positions.data ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            No positions found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(positions.data ?? []).map((position) => (
            <Card key={position.id}>
              <CardContent className="p-5">
                <h3 className="font-display font-semibold">{position.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {electionNames.get(position.electionId) ?? position.electionId}
                </p>
                <p className="mt-3 min-h-10 text-sm text-muted-foreground">
                  {position.description || "No description"}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => start(position)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(`Delete ${position.title}?`)) remove.mutate(position.id);
                    }}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit position" : "Create position"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="flex flex-col gap-3 space-y-2">
              <Label htmlFor="position-election">Election</Label>
              <Select
                value={form.electionId || undefined}
                onValueChange={(electionId) => setForm({ ...form, electionId })}
                disabled={elections.isLoading}
              >
                <SelectTrigger id="position-election" className="h-10">
                  <SelectValue placeholder="Select election" />
                </SelectTrigger>
                <SelectContent>
                  {(elections.data ?? []).map((election) => (
                    <SelectItem key={election.id} value={election.id}>
                      {election.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position-title">Title</Label>
              <Input
                id="position-title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position-description">Description</Label>
              <Textarea
                id="position-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <Button className="w-full" disabled={save.isPending || !form.electionId}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save position
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
