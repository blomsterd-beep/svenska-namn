import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertItemSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Customers
  app.get("/api/customers", async (req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.get("/api/customers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const customer = await storage.getCustomer(id);
    if (!customer) {
      return res.status(404).json({ error: "Kund hittades inte" });
    }
    res.json(customer);
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const data = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(data);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      throw error;
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const data = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, data);
      if (!customer) {
        return res.status(404).json({ error: "Kund hittades inte" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      throw error;
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteCustomer(id);
    res.status(204).send();
  });

  // Items
  app.get("/api/items", async (req, res) => {
    const items = await storage.getItems();
    res.json(items);
  });

  app.get("/api/items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const item = await storage.getItem(id);
    if (!item) {
      return res.status(404).json({ error: "Artikel hittades inte" });
    }
    res.json(item);
  });

  app.post("/api/items", async (req, res) => {
    try {
      const data = insertItemSchema.parse(req.body);
      const item = await storage.createItem(data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      throw error;
    }
  });

  app.patch("/api/items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const data = insertItemSchema.partial().parse(req.body);
      const item = await storage.updateItem(id, data);
      if (!item) {
        return res.status(404).json({ error: "Artikel hittades inte" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      throw error;
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteItem(id);
    res.status(204).send();
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    const transactions = await storage.getTransactions();
    res.json(transactions);
  });

  app.get("/api/transactions/customer/:customerId", async (req, res) => {
    const customerId = parseInt(req.params.customerId);
    const transactions = await storage.getTransactionsByCustomer(customerId);
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const data = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(data);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      throw error;
    }
  });

  // Balances
  app.get("/api/balances", async (req, res) => {
    const balances = await storage.getCustomerBalances();
    res.json(balances);
  });

  app.get("/api/balances/:customerId", async (req, res) => {
    const customerId = parseInt(req.params.customerId);
    const balances = await storage.getCustomerBalance(customerId);
    res.json(balances);
  });

  return httpServer;
}
