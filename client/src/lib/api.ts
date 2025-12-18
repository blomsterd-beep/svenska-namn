import type { Customer, InsertCustomer, Item, InsertItem, Transaction, InsertTransaction, CustomerBalance } from "@shared/schema";

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Ett fel uppstod" }));
    throw new Error(error.error || "Ett fel uppstod");
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const api = {
  customers: {
    getAll: (): Promise<Customer[]> =>
      fetch(`${API_BASE}/customers`).then((r) => handleResponse<Customer[]>(r)),
    get: (id: number): Promise<Customer> =>
      fetch(`${API_BASE}/customers/${id}`).then((r) => handleResponse<Customer>(r)),
    create: (data: InsertCustomer): Promise<Customer> =>
      fetch(`${API_BASE}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => handleResponse<Customer>(r)),
    update: (id: number, data: Partial<InsertCustomer>): Promise<Customer> =>
      fetch(`${API_BASE}/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => handleResponse<Customer>(r)),
    delete: (id: number): Promise<void> =>
      fetch(`${API_BASE}/customers/${id}`, { method: "DELETE" }).then((r) => handleResponse<void>(r)),
  },

  items: {
    getAll: (): Promise<Item[]> =>
      fetch(`${API_BASE}/items`).then((r) => handleResponse<Item[]>(r)),
    get: (id: number): Promise<Item> =>
      fetch(`${API_BASE}/items/${id}`).then((r) => handleResponse<Item>(r)),
    create: (data: InsertItem): Promise<Item> =>
      fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => handleResponse<Item>(r)),
    update: (id: number, data: Partial<InsertItem>): Promise<Item> =>
      fetch(`${API_BASE}/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => handleResponse<Item>(r)),
    delete: (id: number): Promise<void> =>
      fetch(`${API_BASE}/items/${id}`, { method: "DELETE" }).then((r) => handleResponse<void>(r)),
  },

  transactions: {
    getAll: (): Promise<Transaction[]> =>
      fetch(`${API_BASE}/transactions`).then((r) => handleResponse<Transaction[]>(r)),
    getByCustomer: (customerId: number): Promise<Transaction[]> =>
      fetch(`${API_BASE}/transactions/customer/${customerId}`).then((r) => handleResponse<Transaction[]>(r)),
    create: (data: InsertTransaction): Promise<Transaction> =>
      fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => handleResponse<Transaction>(r)),
  },

  balances: {
    getAll: (): Promise<CustomerBalance[]> =>
      fetch(`${API_BASE}/balances`).then((r) => handleResponse<CustomerBalance[]>(r)),
    getByCustomer: (customerId: number): Promise<CustomerBalance[]> =>
      fetch(`${API_BASE}/balances/${customerId}`).then((r) => handleResponse<CustomerBalance[]>(r)),
  },
};
