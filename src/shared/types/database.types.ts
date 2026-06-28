export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ponds: {
        Row: {
          id: string;
          farm_id: string;
          name: string;
          type: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          name: string;
          type: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          farm_id?: string;
          name?: string;
          type?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      farms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          address: string | null;
          description: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          address?: string | null;
          description?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          address?: string | null;
          description?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pond_cycles: {
        Row: {
          id: string;
          pond_id: string;
          fish_type: string;
          initial_stock: number;
          current_stock: number;
          status: "active" | "harvested";
          start_date: string;
          target_days: number | null;
          harvest_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pond_id: string;
          fish_type: string;
          initial_stock: number;
          current_stock: number;
          status?: "active" | "harvested";
          start_date?: string;
          target_days?: number | null;
          harvest_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pond_id?: string;
          fish_type?: string;
          initial_stock?: number;
          current_stock?: number;
          status?: "active" | "harvested";
          start_date?: string;
          target_days?: number | null;
          harvest_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      harvests: {
        Row: {
          id: string;
          cycle_id: string;
          amount_harvested: number;
          weight_kg: number | null;
          harvest_type: "partial" | "final";
          harvest_date: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          cycle_id: string;
          amount_harvested: number;
          weight_kg?: number | null;
          harvest_type: "partial" | "final";
          harvest_date?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          cycle_id?: string;
          amount_harvested?: number;
          weight_kg?: number | null;
          harvest_type?: "partial" | "final";
          harvest_date?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          farm_id: string;
          pond_id: string | null;
          category: string;
          amount: number;
          expense_date: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          farm_id: string;
          pond_id?: string | null;
          category: string;
          amount: number;
          expense_date?: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          farm_id?: string;
          pond_id?: string | null;
          category?: string;
          amount?: number;
          expense_date?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      inventory_items: {
        Row: {
          id: string;
          user_id: string;
          farm_id: string;
          name: string;
          category: string;
          stock_quantity: number;
          unit: string;
          unit_price: number | null;
          min_stock_alert: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          farm_id: string;
          name: string;
          category: string;
          stock_quantity?: number;
          unit?: string;
          unit_price?: number | null;
          min_stock_alert?: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          farm_id?: string;
          name?: string;
          category?: string;
          stock_quantity?: number;
          unit?: string;
          unit_price?: number | null;
          min_stock_alert?: number;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      feeding_logs: {
        Row: {
          id: string;
          cycle_id: string;
          inventory_item_id: string | null;
          feed_time: string;
          amount_kg: number;
          unit_price: number;
          total_cost: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cycle_id: string;
          inventory_item_id?: string | null;
          feed_time?: string;
          amount_kg: number;
          unit_price?: number;
          total_cost?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cycle_id?: string;
          inventory_item_id?: string | null;
          feed_time?: string;
          amount_kg?: number;
          unit_price?: number;
          total_cost?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// ── Convenience row types ──────────────────────────────────────────────────
export type Farm = Database["public"]["Tables"]["farms"]["Row"];
export type Pond = Database["public"]["Tables"]["ponds"]["Row"];
export type PondCycle = Database["public"]["Tables"]["pond_cycles"]["Row"];
export type Harvest = Database["public"]["Tables"]["harvests"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type InventoryItem = Database["public"]["Tables"]["inventory_items"]["Row"];
export type FeedingLog = Database["public"]["Tables"]["feeding_logs"]["Row"];
