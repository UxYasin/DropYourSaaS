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
      listings: {
        Row: {
          id: string;
          url: string;
          name: string | null;
          title: string | null;
          description: string | null;
          favicon_url: string | null;
          email: string | null;
          submitter_email: string | null;
          category: string | null;
          is_for_sale: boolean | null;
          for_sale: boolean | null;
          asking_price: number | null;
          is_verified: boolean | null;
          bid_cents: number;
          clicks: number;
          verification_token: string | null;
          status: string | null;
          twitter_handle: string | null;
          claimed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          name?: string | null;
          title?: string | null;
          description?: string | null;
          favicon_url?: string | null;
          email?: string | null;
          submitter_email?: string | null;
          category?: string | null;
          is_for_sale?: boolean | null;
          for_sale?: boolean | null;
          asking_price?: number | null;
          is_verified?: boolean | null;
          bid_cents?: number;
          clicks?: number;
          verification_token?: string | null;
          status?: string | null;
          twitter_handle?: string | null;
          claimed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          name?: string | null;
          title?: string | null;
          description?: string | null;
          favicon_url?: string | null;
          email?: string | null;
          submitter_email?: string | null;
          category?: string | null;
          is_for_sale?: boolean | null;
          for_sale?: boolean | null;
          asking_price?: number | null;
          is_verified?: boolean | null;
          bid_cents?: number;
          clicks?: number;
          verification_token?: string | null;
          status?: string | null;
          twitter_handle?: string | null;
          claimed_at?: string;
          created_at?: string;
        };
      };
      leaderboard_entries: {
        Row: {
          id: string;
          url: string;
          name: string;
          email: string | null;
          submitter_email: string | null;
          category: string | null;
          is_for_sale: boolean | null;
          for_sale: boolean | null;
          asking_price: number | null;
          is_verified: boolean | null;
          bid_cents: number;
          clicks: number;
          verification_token: string | null;
          status: string | null;
          twitter_handle: string | null;
          claimed_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          name: string;
          email?: string | null;
          submitter_email?: string | null;
          category?: string | null;
          is_for_sale?: boolean | null;
          for_sale?: boolean | null;
          asking_price?: number | null;
          is_verified?: boolean | null;
          bid_cents?: number;
          clicks?: number;
          verification_token?: string | null;
          status?: string | null;
          twitter_handle?: string | null;
          claimed_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          name?: string;
          email?: string | null;
          submitter_email?: string | null;
          category?: string | null;
          is_for_sale?: boolean | null;
          for_sale?: boolean | null;
          asking_price?: number | null;
          is_verified?: boolean | null;
          bid_cents?: number;
          clicks?: number;
          verification_token?: string | null;
          status?: string | null;
          twitter_handle?: string | null;
          claimed_at?: string;
        };
      };
    };
  };
}

export interface ListingType {
  id?: string;
  rank?: number;
  name: string;
  url: string;
  category?: string;
  description?: string;
  is_for_sale?: boolean;
  asking_price?: number;
  is_verified?: boolean;
  clicks?: number;
  upvotes?: number;
  downvotes?: number;
  net_score?: number;
  user_vote?: 1 | -1 | 0;
  favicon?: string;
  preview_image_url?: string;
  twitter_handle?: string | null;
}
