import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Search, TrendingUp, TrendingDown, Scale, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function BalancesPage() {
  const [search, setSearch] = useState("");

  const { data: balances, isLoading } = useQuery({
    queryKey: ["balances"],
    queryFn: api.balances.getAll,
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: api.customers.getAll,
  });

  const filteredBalances = balances?.filter(
    (b) =>
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.itemName.toLowerCase().includes(search.toLowerCase())
  );

  const groupedByCustomer = filteredBalances?.reduce((acc, balance) => {
    if (!acc[balance.customerId]) {
      acc[balance.customerId] = {
        customerName: balance.customerName,
        items: [],
      };
    }
    acc[balance.customerId].items.push(balance);
    return acc;
  }, {} as Record<number, { customerName: string; items: typeof filteredBalances }>);

  const groupedByItem = filteredBalances?.reduce((acc, balance) => {
    if (!acc[balance.itemId]) {
      acc[balance.itemId] = {
        itemName: balance.itemName,
        customers: [],
      };
    }
    acc[balance.itemId].customers.push(balance);
    return acc;
  }, {} as Record<number, { itemName: string; customers: typeof filteredBalances }>);

  const totalOut = filteredBalances?.reduce(
    (sum, b) => sum + (Number(b.balance) > 0 ? Number(b.balance) : 0),
    0
  ) || 0;

  const totalCredit = filteredBalances?.reduce(
    (sum, b) => sum + (Number(b.balance) < 0 ? Math.abs(Number(b.balance)) : 0),
    0
  ) || 0;

  const sendEmail = (customerId: number) => {
    const customer = customers?.find(c => c.id === customerId);
    const customerData = groupedByCustomer?.[customerId];
    
    if (!customer || !customerData) return;

    const email = customer.email || "";
    const subject = encodeURIComponent("Aktuellt saldo - BlomsterLån");
    
    let bodyText = `Hej ${customer.name},\n\nHär kommer ditt aktuella saldo för lånade artiklar:\n\n`;
    customerData.items?.forEach(b => {
      bodyText += `${b.itemName}: ${b.balance} st\n`;
    });
    bodyText += `\nVänliga hälsningar,\nBlomsterLån`;

    window.location.href = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  return (
    <Layout title="Saldon">
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Totalt ute</p>
                <p className="text-2xl font-bold text-amber-600">{totalOut} st</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Totalt tillgodo</p>
                <p className="text-2xl font-bold text-green-600">{totalCredit} st</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiva kunder</p>
                <p className="text-2xl font-bold">
                  {groupedByCustomer ? Object.keys(groupedByCustomer).length : 0}
                </p>
              </div>
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök saldon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="search-balances"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-6 h-32" />
            </Card>
          ))}
        </div>
      ) : filteredBalances && filteredBalances.length > 0 ? (
        <Tabs defaultValue="by-customer">
          <TabsList className="mb-4">
            <TabsTrigger value="by-customer" data-testid="tab-by-customer">
              Per kund
            </TabsTrigger>
            <TabsTrigger value="by-item" data-testid="tab-by-item">
              Per artikel
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">
              Alla
            </TabsTrigger>
          </TabsList>

          <TabsContent value="by-customer" className="space-y-4">
            {groupedByCustomer &&
              Object.entries(groupedByCustomer).map(([customerId, data]) => (
                <Card key={customerId} data-testid={`balance-customer-${customerId}`}>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle className="text-lg">{data.customerName}</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => sendEmail(parseInt(customerId))}
                    >
                      <Mail className="h-4 w-4" /> Skicka saldo
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.items?.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <span>{item.itemName}</span>
                          <span
                            className={`font-bold ${
                              Number(item.balance) > 0 ? "text-amber-600" : "text-green-600"
                            }`}
                          >
                            {Number(item.balance) > 0
                              ? `${item.balance} ute`
                              : `${Math.abs(Number(item.balance))} tillgodo`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="by-item" className="space-y-4">
            {groupedByItem &&
              Object.entries(groupedByItem).map(([itemId, data]) => (
                <Card key={itemId} data-testid={`balance-item-${itemId}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{data.itemName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.customers?.map((customer, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <span>{customer.customerName}</span>
                          <span
                            className={`font-bold ${
                              Number(customer.balance) > 0 ? "text-amber-600" : "text-green-600"
                            }`}
                          >
                            {Number(customer.balance) > 0
                              ? `${customer.balance} ute`
                              : `${Math.abs(Number(customer.balance))} tillgodo`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Kund</th>
                        <th className="text-left py-2 font-medium">Artikel</th>
                        <th className="text-right py-2 font-medium">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBalances.map((balance, i) => (
                        <tr
                          key={i}
                          className="border-b last:border-0"
                          data-testid={`balance-row-${balance.customerId}-${balance.itemId}`}
                        >
                          <td className="py-2">{balance.customerName}</td>
                          <td className="py-2">{balance.itemName}</td>
                          <td
                            className={`py-2 text-right font-bold ${
                              Number(balance.balance) > 0 ? "text-amber-600" : "text-green-600"
                            }`}
                          >
                            {Number(balance.balance) > 0
                              ? `${balance.balance} ute`
                              : `${Math.abs(Number(balance.balance))} tillgodo`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {search
              ? "Inga saldon matchar din sökning"
              : "Inga aktiva saldon. Skapa transaktioner för att se saldon här."}
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
