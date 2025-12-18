import { 
  users, type User, type InsertUser,
  customers, type Customer, type InsertCustomer,
  items, type Item, type InsertItem,
  transactions, type Transaction, type InsertTransaction,
  type CustomerBalance
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  getItems(): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;
  
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByCustomer(customerId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  getCustomerBalances(): Promise<CustomerBalance[]>;
  getCustomerBalance(customerId: number): Promise<CustomerBalance[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCustomers(): Promise<Customer[]> {
    return db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updated || undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return true;
  }

  async getItems(): Promise<Item[]> {
    return db.select().from(items);
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined> {
    const [updated] = await db.update(items).set(item).where(eq(items.id, id)).returning();
    return updated || undefined;
  }

  async deleteItem(id: number): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id));
    return true;
  }

  async getTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(sql`${transactions.createdAt} DESC`);
  }

  async getTransactionsByCustomer(customerId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.customerId, customerId)).orderBy(sql`${transactions.createdAt} DESC`);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values({
      ...transaction,
      type: transaction.type as "delivery" | "return"
    }).returning();
    return newTransaction;
  }

  async getCustomerBalances(): Promise<CustomerBalance[]> {
    const result = await db.execute(sql`
      SELECT 
        t.customer_id as "customerId",
        c.name as "customerName",
        t.item_id as "itemId",
        i.name as "itemName",
        SUM(CASE WHEN t.type = 'delivery' THEN t.quantity ELSE -t.quantity END) as "balance"
      FROM ${transactions} t
      JOIN ${customers} c ON t.customer_id = c.id
      JOIN ${items} i ON t.item_id = i.id
      GROUP BY t.customer_id, c.name, t.item_id, i.name
      HAVING SUM(CASE WHEN t.type = 'delivery' THEN t.quantity ELSE -t.quantity END) != 0
      ORDER BY c.name, i.name
    `);
    return result.rows as CustomerBalance[];
  }

  async getCustomerBalance(customerId: number): Promise<CustomerBalance[]> {
    const result = await db.execute(sql`
      SELECT 
        t.customer_id as "customerId",
        c.name as "customerName",
        t.item_id as "itemId",
        i.name as "itemName",
        SUM(CASE WHEN t.type = 'delivery' THEN t.quantity ELSE -t.quantity END) as "balance"
      FROM ${transactions} t
      JOIN ${customers} c ON t.customer_id = c.id
      JOIN ${items} i ON t.item_id = i.id
      WHERE t.customer_id = ${customerId}
      GROUP BY t.customer_id, c.name, t.item_id, i.name
      ORDER BY i.name
    `);
    return result.rows as CustomerBalance[];
  }
}

export const storage = new DatabaseStorage();
