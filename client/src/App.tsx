import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import CustomersPage from "@/pages/customers";
import ItemsPage from "@/pages/items";
import TransactionsPage from "@/pages/transactions";
import BalancesPage from "@/pages/balances";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/customers" component={CustomersPage} />
      <Route path="/items" component={ItemsPage} />
      <Route path="/transactions" component={TransactionsPage} />
      <Route path="/balances" component={BalancesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-right" richColors />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
