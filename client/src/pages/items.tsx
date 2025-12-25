import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Search, Package, Car, ImageIcon } from "lucide-react";
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
      imageUrl: formData.get("imageUrl") as string || null,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getItemIcon = (item: Item) => {
    if (item.imageUrl) {
      return (
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="h-full w-full object-cover rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = ""; // Fallback to icon
            (e.target as HTMLImageElement).className = "hidden";
          }}
        />
      );
    }
    const searchStr = (item.name + (item.category || "")).toLowerCase();
    if (searchStr.includes("bil") || searchStr.includes("lastbil") || searchStr.includes("fordon")) {
      return <Car className="h-4 w-4" />;
    }
    return <Package className="h-4 w-4" />;
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
                  placeholder="t.ex. Hinkar, Vagnar, Kärl, Bilar"
                  defaultValue={editingItem?.category || ""}
                  data-testid="input-item-category"
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Bild-URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    placeholder="https://exempel.se/bild.jpg"
                    defaultValue={editingItem?.imageUrl || ""}
                    data-testid="input-item-image-url"
                  />
                  <div className="h-10 w-10 border rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Klistra in en länk till en bild på artikeln.
                </p>
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
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-3 h-12" />
            </Card>
          ))}
        </div>
      ) : filteredItems && filteredItems.length > 0 ? (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <Card key={item.id} data-testid={`item-card-${item.id}`} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center px-4 py-2 hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                      {getItemIcon(item)}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          {item.category && (
                            <span className="inline-block px-1.5 py-0.5 bg-muted rounded text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">
                              {item.category}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-4">
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
                          <Pencil className="h-4 w-4" />
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
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
