export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          color_theme: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          logo_url: string | null
          name: string
          position: number | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          color_theme?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name: string
          position?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          color_theme?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name?: string
          position?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          session_id: string | null
          updated_at: string
          user_id: string | null
          variant_data: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
          variant_data?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
          variant_data?: Json | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color_theme: string | null
          created_at: string
          description: string | null
          has_children: boolean | null
          icon_name: string | null
          id: string
          image_url: string | null
          is_active: boolean
          level: number | null
          name: string
          parent_id: string | null
          position: number | null
          product_count: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          color_theme?: string | null
          created_at?: string
          description?: string | null
          has_children?: boolean | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          level?: number | null
          name: string
          parent_id?: string | null
          position?: number | null
          product_count?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          color_theme?: string | null
          created_at?: string
          description?: string | null
          has_children?: boolean | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          level?: number | null
          name?: string
          parent_id?: string | null
          position?: number | null
          product_count?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      homepage_banners: {
        Row: {
          animation_speed: number | null
          background_color: string | null
          banner_type: string | null
          created_at: string
          cta_link: string | null
          cta_text: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          position: number | null
          subtitle: string | null
          text_color: string | null
          title: string
          updated_at: string
        }
        Insert: {
          animation_speed?: number | null
          background_color?: string | null
          banner_type?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          position?: number | null
          subtitle?: string | null
          text_color?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          animation_speed?: number | null
          background_color?: string | null
          banner_type?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          position?: number | null
          subtitle?: string | null
          text_color?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_library: {
        Row: {
          alt_text: string | null
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          filename: string
          id: string
          is_active: boolean
          mime_type: string
          original_name: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          filename: string
          id?: string
          is_active?: boolean
          mime_type: string
          original_name: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          filename?: string
          id?: string
          is_active?: boolean
          mime_type?: string
          original_name?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          title: string
          updated_at: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          title: string
          updated_at?: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          title?: string
          updated_at?: string
          user_id?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          id: string
          order_items: Json
          order_number: string
          shipping_address: Json
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_items: Json
          order_number: string
          shipping_address: Json
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_items?: Json
          order_number?: string
          shipping_address?: Json
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_editorial: {
        Row: {
          created_at: string
          editorial_notes: string | null
          featured_position: number | null
          id: string
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_new_arrival: boolean | null
          is_trending: boolean | null
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          editorial_notes?: string | null
          featured_position?: number | null
          id?: string
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          is_trending?: boolean | null
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          editorial_notes?: string | null
          featured_position?: number | null
          id?: string
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          is_trending?: boolean | null
          product_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_media: {
        Row: {
          alt_text: string | null
          created_at: string
          description: string | null
          file_size: number | null
          id: string
          is_primary: boolean | null
          media_type: string
          media_url: string
          mime_type: string | null
          position: number | null
          product_id: string
          title: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          id?: string
          is_primary?: boolean | null
          media_type: string
          media_url: string
          mime_type?: string | null
          position?: number | null
          product_id: string
          title?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          id?: string
          is_primary?: boolean | null
          media_type?: string
          media_url?: string
          mime_type?: string | null
          position?: number | null
          product_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          review_text: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          review_text?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          review_text?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          price_adjustment: number | null
          product_id: string
          sku: string | null
          stock_quantity: number | null
          variant_name: string
          variant_value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          price_adjustment?: number | null
          product_id: string
          sku?: string | null
          stock_quantity?: number | null
          variant_name: string
          variant_value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          price_adjustment?: number | null
          product_id?: string
          sku?: string | null
          stock_quantity?: number | null
          variant_name?: string
          variant_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          age_group: string | null
          benefits: string | null
          brand: string
          category: string
          cost_price: number
          country_of_origin: string | null
          created_at: string
          description: string | null
          dimensions: Json | null
          discount_percentage: number | null
          expiry_date: string | null
          gender: string | null
          how_to_use: string | null
          id: string
          ingredients: string | null
          is_active: boolean | null
          is_featured: boolean | null
          keywords: string | null
          manufacturing_date: string | null
          name: string
          product_code: string | null
          product_id: string
          safety_information: string | null
          selling_price: number | null
          seo_description: string | null
          seo_title: string | null
          size: string | null
          skin_type: string[] | null
          slug: string
          stock_quantity: number
          supplier_id: string | null
          tags: string[] | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          age_group?: string | null
          benefits?: string | null
          brand: string
          category: string
          cost_price: number
          country_of_origin?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          discount_percentage?: number | null
          expiry_date?: string | null
          gender?: string | null
          how_to_use?: string | null
          id?: string
          ingredients?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          keywords?: string | null
          manufacturing_date?: string | null
          name: string
          product_code?: string | null
          product_id: string
          safety_information?: string | null
          selling_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          size?: string | null
          skin_type?: string[] | null
          slug: string
          stock_quantity?: number
          supplier_id?: string | null
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          age_group?: string | null
          benefits?: string | null
          brand?: string
          category?: string
          cost_price?: number
          country_of_origin?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          discount_percentage?: number | null
          expiry_date?: string | null
          gender?: string | null
          how_to_use?: string | null
          id?: string
          ingredients?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          keywords?: string | null
          manufacturing_date?: string | null
          name?: string
          product_code?: string | null
          product_id?: string
          safety_information?: string | null
          selling_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          size?: string | null
          skin_type?: string[] | null
          slug?: string
          stock_quantity?: number
          supplier_id?: string | null
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          mobile_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          mobile_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          mobile_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          postal_code: string
          state: string
          street_address: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          postal_code: string
          state: string
          street_address: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          postal_code?: string
          state?: string
          street_address?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          setting_key: string
          setting_type: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key: string
          setting_type?: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_type?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      static_pages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      supplier_products: {
        Row: {
          commission_rate: number | null
          created_at: string
          id: string
          is_active: boolean | null
          product_id: string
          supplier_id: string
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          product_id: string
          supplier_id: string
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          product_id?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: Json | null
          bank_details: Json | null
          business_license: string | null
          commission_rate: number | null
          company_name: string
          contact_person: string
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          phone: string | null
          rating: number | null
          status: string
          tax_id: string | null
          total_products: number | null
          total_revenue: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          bank_details?: Json | null
          business_license?: string | null
          commission_rate?: number | null
          company_name: string
          contact_person: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          rating?: number | null
          status?: string
          tax_id?: string | null
          total_products?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          bank_details?: Json | null
          business_license?: string | null
          commission_rate?: number | null
          company_name?: string
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          rating?: number | null
          status?: string
          tax_id?: string | null
          total_products?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          id: string
          is_active: boolean
          position: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_type: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean
          position?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_type?: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean
          position?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_type?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          target_user_id: string
          target_user_role: Database["public"]["Enums"]["user_role"]
          notification_title: string
          notification_message: string
          notification_type_param: Database["public"]["Enums"]["notification_type"]
          notification_metadata?: Json
        }
        Returns: string
      }
      create_sample_notifications_for_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_supplier_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_unread_notifications_count: {
        Args: { user_role_param?: Database["public"]["Enums"]["user_role"] }
        Returns: number
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      mark_notification_read: {
        Args: { notification_id: string }
        Returns: undefined
      }
      sync_brands_from_products: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "supplier" | "customer"
      notification_type:
        | "order_status"
        | "stock_alert"
        | "payment_confirmed"
        | "product_approved"
        | "supplier_request"
        | "system_maintenance"
        | "promotion"
        | "review_request"
      order_status:
        | "processing"
        | "dispatched"
        | "delivered"
        | "cancelled"
        | "returned"
      user_role: "customer" | "supplier" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "supplier", "customer"],
      notification_type: [
        "order_status",
        "stock_alert",
        "payment_confirmed",
        "product_approved",
        "supplier_request",
        "system_maintenance",
        "promotion",
        "review_request",
      ],
      order_status: [
        "processing",
        "dispatched",
        "delivered",
        "cancelled",
        "returned",
      ],
      user_role: ["customer", "supplier", "admin"],
    },
  },
} as const
