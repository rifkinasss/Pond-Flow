export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
        };
      };
      farms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          address: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          address?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          address?: string | null;
          description?: string | null;
        };
      };
      ponds: {
        Row: {
          id: string;
          farm_id: string;
          name: string;
          type: "tanah" | "terpal" | "beton" | "keramba";
          size_m2: number | null;
          capacity_kg: number | null;
          status: "active" | "inactive";
          created_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          name: string;
          type: "tanah" | "terpal" | "beton" | "keramba";
          size_m2?: number | null;
          capacity_kg?: number | null;
          status?: "active" | "inactive";
          created_at?: string;
        };
        Update: {
          name?: string;
          type?: "tanah" | "terpal" | "beton" | "keramba";
          size_m2?: number | null;
          capacity_kg?: number | null;
          status?: "active" | "inactive";
        };
      };
      cycles: {
        Row: {
          id: string;
          pond_id: string;
          fish_type: string;
          seed_count: number | null;
          seed_weight_gram: number | null;
          seed_price_per_unit: number | null;
          start_date: string;
          target_harvest_date: string | null;
          status: "active" | "harvested" | "failed";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pond_id: string;
          fish_type: string;
          seed_count?: number | null;
          seed_weight_gram?: number | null;
          seed_price_per_unit?: number | null;
          start_date: string;
          target_harvest_date?: string | null;
          status?: "active" | "harvested" | "failed";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          fish_type?: string;
          seed_count?: number | null;
          seed_weight_gram?: number | null;
          seed_price_per_unit?: number | null;
          start_date?: string;
          target_harvest_date?: string | null;
          status?: "active" | "harvested" | "failed";
          notes?: string | null;
        };
      };
      expenses: {
        Row: {
          id: string;
          farm_id: string;
          pond_id: string | null;
          cycle_id: string | null;
          category: string;
          item_name: string;
          quantity: number;
          unit: string;
          price_per_unit: number;
          total_amount: number;
          date: string;
          notes: string | null;
          is_deleted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          pond_id?: string | null;
          cycle_id?: string | null;
          category: string;
          item_name: string;
          quantity: number;
          unit: string;
          price_per_unit: number;
          date: string;
          notes?: string | null;
          is_deleted?: boolean;
          created_at?: string;
        };
        Update: {
          category?: string;
          item_name?: string;
          quantity?: number;
          unit?: string;
          price_per_unit?: number;
          date?: string;
          notes?: string | null;
          is_deleted?: boolean;
        };
      };
      incomes: {
        Row: {
          id: string;
          farm_id: string;
          cycle_id: string | null;
          type: "harvest" | "other";
          harvest_weight_kg: number | null;
          price_per_kg: number | null;
          total_amount: number;
          buyer: string | null;
          date: string;
          notes: string | null;
          is_deleted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          cycle_id?: string | null;
          type?: "harvest" | "other";
          harvest_weight_kg?: number | null;
          price_per_kg?: number | null;
          total_amount: number;
          buyer?: string | null;
          date: string;
          notes?: string | null;
          is_deleted?: boolean;
          created_at?: string;
        };
        Update: {
          type?: "harvest" | "other";
          harvest_weight_kg?: number | null;
          price_per_kg?: number | null;
          total_amount?: number;
          buyer?: string | null;
          date?: string;
          notes?: string | null;
          is_deleted?: boolean;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          farm_id: string;
          name: string;
          category: "feed" | "medicine" | "equipment" | "other";
          unit: string;
          current_stock: number;
          minimum_stock: number;
          price_per_unit: number | null;
          last_updated: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          name: string;
          category: "feed" | "medicine" | "equipment" | "other";
          unit: string;
          current_stock?: number;
          minimum_stock?: number;
          price_per_unit?: number | null;
          last_updated?: string;
        };
        Update: {
          name?: string;
          category?: "feed" | "medicine" | "equipment" | "other";
          unit?: string;
          current_stock?: number;
          minimum_stock?: number;
          price_per_unit?: number | null;
        };
      };
      inventory_transactions: {
        Row: {
          id: string;
          item_id: string;
          type: "in" | "out";
          quantity: number;
          reference_id: string | null;
          date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          type: "in" | "out";
          quantity: number;
          reference_id?: string | null;
          date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          quantity?: number;
          notes?: string | null;
        };
      };
      harvest_reports: {
        Row: {
          id: string;
          cycle_id: string;
          total_expense: number;
          total_income: number;
          hpp_per_kg: number;
          gross_profit: number;
          margin_percent: number;
          fcr: number | null;
          generated_at: string;
        };
        Insert: {
          id?: string;
          cycle_id: string;
          total_expense: number;
          total_income: number;
          hpp_per_kg: number;
          gross_profit: number;
          margin_percent: number;
          fcr?: number | null;
          generated_at?: string;
        };
        Update: {
          total_expense?: number;
          total_income?: number;
          hpp_per_kg?: number;
          gross_profit?: number;
          margin_percent?: number;
          fcr?: number | null;
        };
      };
      ai_insights: {
        Row: {
          id: string;
          cycle_id: string;
          harvest_report_id: string | null;
          composite_score: number;
          grade: string;
          flags: Json;
          ai_analysis: string | null;
          ai_recommendations: Json | null;
          ai_model: string;
          ai_generated_at: string | null;
          used_fallback: boolean;
          generated_at: string;
        };
        Insert: {
          id?: string;
          cycle_id: string;
          harvest_report_id?: string | null;
          composite_score: number;
          grade: string;
          flags: Json;
          ai_analysis?: string | null;
          ai_recommendations?: Json | null;
          ai_model?: string;
          ai_generated_at?: string | null;
          used_fallback?: boolean;
          generated_at?: string;
        };
        Update: {
          composite_score?: number;
          grade?: string;
          flags?: Json;
          ai_analysis?: string | null;
          ai_recommendations?: Json | null;
          ai_generated_at?: string | null;
          used_fallback?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      pond_type: "tanah" | "terpal" | "beton" | "keramba";
      cycle_status: "active" | "harvested" | "failed";
      inventory_category: "feed" | "medicine" | "equipment" | "other";
      transaction_type: "in" | "out";
      income_type: "harvest" | "other";
    };
  };
}

// Convenience type aliases
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Farm = Tables<"farms">;
export type Pond = Tables<"ponds">;
export type Cycle = Tables<"cycles">;
export type Expense = Tables<"expenses">;
export type Income = Tables<"incomes">;
export type InventoryItem = Tables<"inventory_items">;
export type InventoryTransaction = Tables<"inventory_transactions">;
export type HarvestReport = Tables<"harvest_reports">;
export type AiInsight = Tables<"ai_insights">;
