import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import { toast } from "sonner";
import type { Item, InsertItem } from "@shared/schema";

export default function ItemsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: api.items.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.items.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setDialogOpen(false);
      toast.success("Artikel skapad");
    },
    onError: (error) => {
      toast.error("Fel", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertItem> }) =>
      api.items.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setDialogOpen(false);
      setEditingItem(null);
      toast.success("Artikel uppdaterad");
    },
    onError: (error) => {
      toast.error("Fel", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.items.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Artikel borttagen");
    },
    onError: (error) => {
      toast.error("Fel", { description: error.message });
    },
  });

  const filteredItems = items?.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: InsertItem = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || null,
      category: formData.get("category") as string || null,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Layout title="Artiklar">
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök artiklar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="search-items"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(null);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="add-item-button">
              <Plus className="h-4 w-4" /> Lägg till artikel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Redigera artikel" : "Ny artikel"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Namn *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={editingItem?.name || ""}
                  data-testid="input-item-name"
                />
              </div>
              <div>
                <Label htmlFor="description">Beskrivning</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editingItem?.description || ""}
                  data-testid="input-item-description"
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="t.ex. Hinkar, Vagnar, Kärl"
                  defaultValue={editingItem?.category || ""}
                  data-testid="input-item-category"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="submit-item"
              >
                {editingItem ? "Spara ändringar" : "Skapa artikel"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-24" />
            </Card>
          ))}
        </div>
      ) : filteredItems && filteredItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <Card key={item.id} data-testid={`item-card-${item.id}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingItem(item);
                        setDialogOpen(true);
                      }}
                      data-testid={`edit-item-${item.id}`}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        if (confirm("Är du säker på att du vill ta bort denna artikel?")) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                      data-testid={`delete-item-${item.id}`}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.category && (
                  <span className="inline-block px-2 py-0.5 bg-muted rounded text-xs">
                    {item.category}
                  </span>
                )}
                {item.description && <p className="mt-2">{item.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {search ? "Inga artiklar matchar din sökning" : "Inga artiklar ännu. Lägg till din första artikel!"}
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
