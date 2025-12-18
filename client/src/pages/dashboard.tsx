import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Users, Package, ClipboardList, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: api.customers.getAll,
  });

  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ["items"],
    queryFn: api.items.getAll,
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: api.transactions.getAll,
  });

  const { data: balances, isLoading: loadingBalances } = useQuery({
    queryKey: ["balances"],
    queryFn: api.balances.getAll,
  });

  const totalOut = balances?.reduce((sum, b) => sum + (Number(b.balance) > 0 ? Number(b.balance) : 0), 0) || 0;
  const deliveries = transactions?.filter(t => t.type === "delivery").length || 0;
  const returns = transactions?.filter(t => t.type === "return").length || 0;

  return (
    <Layout title="Översikt">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Kunder"
          value={customers?.length || 0}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          loading={loadingCustomers}
          href="/customers"
        />
        <StatCard
          title="Artiklar"
          value={items?.length || 0}
          icon={<Package className="h-5 w-5 text-purple-500" />}
          loading={loadingItems}
          href="/items"
        />
        <StatCard
          title="Utleveranser"
          value={deliveries}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          loading={loadingTransactions}
          href="/transactions"
        />
        <StatCard
          title="Returer"
          value={returns}
          icon={<TrendingDown className="h-5 w-5 text-amber-500" />}
          loading={loadingTransactions}
          href="/transactions"
        />
      </div>

      <div className="grid gap-6 mt-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Senaste transaktioner</CardTitle>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="gap-1">
                Visa alla <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingTransactions ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`transaction-item-${t.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {t.type === "delivery" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-amber-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {t.type === "delivery" ? "Utleverans" : "Retur"}: {t.quantity} st
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.createdAt).toLocaleDateString("sv-SE")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Inga transaktioner ännu
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Aktuella saldon</CardTitle>
            <Link href="/balances">
              <Button variant="ghost" size="sm" className="gap-1">
                Visa alla <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingBalances ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : balances && balances.length > 0 ? (
              <div className="space-y-3">
                {balances.slice(0, 5).map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`balance-item-${b.customerId}-${b.itemId}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{b.customerName}</p>
                      <p className="text-xs text-muted-foreground">{b.itemName}</p>
                    </div>
                    <span className={`font-bold ${Number(b.balance) > 0 ? "text-amber-600" : "text-green-600"}`}>
                      {Number(b.balance) > 0 ? `${b.balance} ute` : `${Math.abs(Number(b.balance))} tillgodo`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Inga aktiva saldon
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Snabbstart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/customers">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Users className="h-6 w-6 text-primary" />
                <span>Lägg till kund</span>
              </Button>
            </Link>
            <Link href="/items">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Package className="h-6 w-6 text-primary" />
                <span>Lägg till artikel</span>
              </Button>
            </Link>
            <Link href="/transactions">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <ClipboardList className="h-6 w-6 text-primary" />
                <span>Ny transaktion</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

function StatCard({
  title,
  value,
  icon,
  loading,
  href,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-3xl font-bold" data-testid={`stat-${title.toLowerCase()}`}>
                  {value}
                </p>
              )}
            </div>
            <div className="p-3 bg-muted rounded-full">{icon}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
