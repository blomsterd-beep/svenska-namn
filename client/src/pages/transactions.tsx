import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Plus, TrendingUp, TrendingDown, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { InsertTransaction } from "@shared/schema";

interface TransactionItem {
  itemId: string;
  quantity: number;
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"delivery" | "return">("delivery");
  const [itemsList, setItemsList] = useState<TransactionItem[]>([{ itemId: "", quantity: 0 }]);
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: api.transactions.getAll,
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: api.customers.getAll,
  });

  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: api.items.getAll,
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTransaction[]) => {
      for (const transaction of data) {
        await api.transactions.create(transaction);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      setDialogOpen(false);
      setItemsList([{ itemId: "", quantity: 0 }]);
      toast.success(transactionType === "delivery" ? "Utleveranser registrerade" : "Returer registrerade");
    },
    onError: (error) => {
      toast.error("Fel", { description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerId = parseInt(formData.get("customerId") as string);
    const note = formData.get("note") as string || null;

    const transactionsToCreate: InsertTransaction[] = itemsList
      .filter(item => item.itemId && item.quantity > 0)
      .map(item => ({
        customerId,
        itemId: parseInt(item.itemId),
        quantity: item.quantity,
        type: transactionType,
        note,
      }));

    if (transactionsToCreate.length === 0) {
      toast.error("Lägg till minst en artikel med antal > 0");
      return;
    }

    createMutation.mutate(transactionsToCreate);
  };

  const addItemRow = () => {
    setItemsList([...itemsList, { itemId: "", quantity: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (itemsList.length > 1) {
      const newList = [...itemsList];
      newList.splice(index, 1);
      setItemsList(newList);
    }
  };

  const updateItemRow = (index: number, field: keyof TransactionItem, value: string) => {
    const newList = [...itemsList];
    newList[index] = { 
      ...newList[index], 
      [field]: field === "quantity" ? parseInt(value) || 0 : value 
    };
    setItemsList(newList);
  };

  const getCustomerName = (id: number) => customers?.find((c) => c.id === id)?.name || "Okänd";
  const getItemName = (id: number) => items?.find((i) => i.id === id)?.name || "Okänd";

  const filteredTransactions = transactions?.filter((t) => {
    const customerName = getCustomerName(t.customerId).toLowerCase();
    const itemName = getItemName(t.itemId).toLowerCase();
    return customerName.includes(search.toLowerCase()) || itemName.includes(search.toLowerCase());
  });

  return (
    <Layout title="Transaktioner">
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök transaktioner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="search-transactions"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setItemsList([{ itemId: "", quantity: 0 }]);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="add-transaction-button">
              <Plus className="h-4 w-4" /> Ny transaktion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ny transaktion</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Typ</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Button
                    type="button"
                    variant={transactionType === "delivery" ? "default" : "outline"}
                    onClick={() => setTransactionType("delivery")}
                    className="gap-2"
                    data-testid="type-delivery"
                  >
                    <TrendingUp className="h-4 w-4" /> Utleverans
                  </Button>
                  <Button
                    type="button"
                    variant={transactionType === "return" ? "default" : "outline"}
                    onClick={() => setTransactionType("return")}
                    className="gap-2"
                    data-testid="type-return"
                  >
                    <TrendingDown className="h-4 w-4" /> Retur
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="customerId">Kund *</Label>
                <Select name="customerId" required>
                  <SelectTrigger data-testid="select-customer">
                    <SelectValue placeholder="Välj kund" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                        {customer.company && ` (${customer.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Artiklar</Label>
                {itemsList.map((row, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-grow">
                      <Select 
                        value={row.itemId} 
                        onValueChange={(val) => updateItemRow(index, "itemId", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Välj artikel" />
                        </SelectTrigger>
                        <SelectContent>
                          {items?.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        value={row.quantity}
                        onChange={(e) => updateItemRow(index, "quantity", e.target.value)}
                        placeholder="Antal"
                      />
                    </div>
                    {itemsList.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeItemRow(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addItemRow}
                  className="w-full gap-2 mt-2"
                >
                  <Plus className="h-3 w-3" /> Lägg till fler produkter
                </Button>
              </div>

              <div>
                <Label htmlFor="note">Anteckning</Label>
                <Input
                  id="note"
                  name="note"
                  placeholder="Valfri anteckning..."
                  data-testid="input-note"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
                data-testid="submit-transaction"
              >
                {transactionType === "delivery" ? "Registrera utleveranser" : "Registrera returer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {(!customers || customers.length === 0 || !items || items.length === 0) && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="py-4 text-amber-800">
            {!customers || customers.length === 0 ? (
              <p>Du måste lägga till minst en kund innan du kan skapa transaktioner.</p>
            ) : (
              <p>Du måste lägga till minst en artikel innan du kan skapa transaktioner.</p>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-6 h-20" />
            </Card>
          ))}
        </div>
      ) : filteredTransactions && filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} data-testid={`transaction-card-${transaction.id}`}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === "delivery" 
                        ? "bg-green-100 text-green-600" 
                        : "bg-amber-100 text-amber-600"
                    }`}>
                      {transaction.type === "delivery" ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {getCustomerName(transaction.customerId)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getItemName(transaction.itemId)} • {transaction.quantity} st
                      </p>
                      {transaction.note && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {transaction.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === "delivery" ? "text-green-600" : "text-amber-600"
                    }`}>
                      {transaction.type === "delivery" ? "Utleverans" : "Retur"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString("sv-SE")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {search ? "Inga transaktioner matchar din sökning" : "Inga transaktioner ännu."}
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
