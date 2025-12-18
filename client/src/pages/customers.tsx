import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Customer, InsertCustomer } from "@shared/schema";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: api.customers.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.customers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDialogOpen(false);
      toast.success("Kund skapad");
    },
    onError: (error) => {
      toast.error("Fel", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertCustomer> }) =>
      api.customers.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDialogOpen(false);
      setEditingCustomer(null);
      toast.success("Kund uppdaterad");
    },
    onError: (error) => {
      toast.error("Fel", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.customers.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Kund borttagen");
    },
    onError: (error) => {
      toast.error("Fel", { description: error.message });
    },
  });

  const filteredCustomers = customers?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: InsertCustomer = {
      name: formData.get("name") as string,
      company: formData.get("company") as string || null,
      phone: formData.get("phone") as string || null,
      email: formData.get("email") as string || null,
      address: formData.get("address") as string || null,
    };

    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Layout title="Kunder">
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök kunder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="search-customers"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingCustomer(null);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="add-customer-button">
              <Plus className="h-4 w-4" /> Lägg till kund
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Redigera kund" : "Ny kund"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Namn *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={editingCustomer?.name || ""}
                  data-testid="input-customer-name"
                />
              </div>
              <div>
                <Label htmlFor="company">Företag</Label>
                <Input
                  id="company"
                  name="company"
                  defaultValue={editingCustomer?.company || ""}
                  data-testid="input-customer-company"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={editingCustomer?.phone || ""}
                  data-testid="input-customer-phone"
                />
              </div>
              <div>
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingCustomer?.email || ""}
                  data-testid="input-customer-email"
                />
              </div>
              <div>
                <Label htmlFor="address">Adress</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={editingCustomer?.address || ""}
                  data-testid="input-customer-address"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="submit-customer"
              >
                {editingCustomer ? "Spara ändringar" : "Skapa kund"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-32" />
            </Card>
          ))}
        </div>
      ) : filteredCustomers && filteredCustomers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} data-testid={`customer-card-${customer.id}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{customer.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCustomer(customer);
                        setDialogOpen(true);
                      }}
                      data-testid={`edit-customer-${customer.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Är du säker på att du vill ta bort denna kund?")) {
                          deleteMutation.mutate(customer.id);
                        }
                      }}
                      data-testid={`delete-customer-${customer.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                {customer.company && <p>{customer.company}</p>}
                {customer.phone && <p>{customer.phone}</p>}
                {customer.email && <p>{customer.email}</p>}
                {customer.address && <p>{customer.address}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {search ? "Inga kunder matchar din sökning" : "Inga kunder ännu. Lägg till din första kund!"}
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
