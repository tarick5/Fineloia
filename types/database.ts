export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          country: string;
          currency: string;
          sector: string;
          size: string;
          plan: string;
          billing_cycle: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          trial_ends_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
      };
      members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["members"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["members"]["Row"]>;
      };
      transactions: {
        Row: {
          id: string;
          organization_id: string;
          date: string;
          description: string;
          amount: number;
          category: string;
          subcategory: string | null;
          account: string;
          currency: string;
          source: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["transactions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["transactions"]["Row"]>;
      };
      accounts: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          type: string;
          currency: string;
          balance: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["accounts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["accounts"]["Row"]>;
      };
      reports: {
        Row: {
          id: string;
          organization_id: string;
          type: string;
          period_start: string;
          period_end: string;
          content: Json;
          ai_analysis: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reports"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["reports"]["Row"]>;
      };
      alerts: {
        Row: {
          id: string;
          organization_id: string;
          type: string;
          severity: string;
          title: string;
          body: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["alerts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["alerts"]["Row"]>;
      };
      forecasts: {
        Row: {
          id: string;
          organization_id: string;
          type: string;
          period: string;
          scenario: string;
          data: Json;
          generated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["forecasts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["forecasts"]["Row"]>;
      };
      conversations: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          messages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
      };
      kpis: {
        Row: {
          id: string;
          organization_id: string;
          period: string;
          revenue: number;
          expenses: number;
          gross_margin: number;
          operating_margin: number;
          net_margin: number;
          cashflow: number;
          burn_rate: number;
          runway_months: number;
          arr: number;
          mrr: number;
          calculated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["kpis"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["kpis"]["Row"]>;
      };
      benchmarks: {
        Row: {
          id: string;
          sector: string;
          country: string;
          size: string;
          metric: string;
          value: number;
          percentile_25: number;
          percentile_50: number;
          percentile_75: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["benchmarks"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["benchmarks"]["Row"]>;
      };
    };
  };
};
