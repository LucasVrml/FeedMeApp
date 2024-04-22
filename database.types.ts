import { PostgrestError } from "@supabase/supabase-js"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type friendsRecipes = {
  [key: string]: {
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    recipes: FormattedRecipe[];
  };
};

export type askingFriendsType = {
  [key: string]: { id: string; first_name: string; last_name: string };
};

export type Friend = {
  friend_id: string,
  is_accepted: boolean
}

export type plannedRecipesType =
  | {
    date: string;
    recipe: {
      id: number;
      name: string;
    };
  }[]
  | null;

export type allRecipes =
  | {
    id: number;
    name: string;
  }[]
  | null;

export type RecipesGroupedByUser = { error: PostgrestError | null, recipeData?: friendsRecipes, askingFriends?: askingFriendsType }

export type Category = {
  id: number,
  name: string,
  active?: boolean,
  user_id?: string,
}

export type ListsType = {
  id: number,
  name: string,
  personal: boolean,
  ingredients: ListIngredient[] | null,
  users: {
    id: string,
    name: string,
  }[],
  additional_ingredients: AdditionalListIngredient[] | null
}

export type ListIngredient = {
  id: number;
  name: string;
  quantity?: number;
  checked: boolean;
  unit?: string;
};

export type AdditionalListIngredient = {
  list_id: number,
  id?: number;
  name: string;
  checked: boolean;
};

export type IngredientDetail = {
  id: number;
  name: string;
  quantity?: number | null;
  unit?: string;
};

export type FormattedRecipe = {
  id: number;
  name: string;
  steps: string[];
  counter: number;
  category?: Category[];
  image_url?: string;
  image_path?: string;
  ingredients: IngredientDetail[];
  user_id?: {
    id: string,
    first_name: string,
    last_name: string,
  },
};

export type ApiIngredient = {
  id: number;
  name: string;
};

// Définition du type pour un ingrédient de recette, incluant l'ingrédient et ses détails (quantité, unité)
export type RecipeIngredient = {
  unit: string;
  quantity?: number;
  ingredient: ApiIngredient;
};

// Définition du type pour une recette, incluant le nom, le compteur, les étapes et les ingrédients de recette
export type Recipe = {
  id: number,
  name: string;
  counter: number;
  steps: string[];
  category: Category[];
  image_url?: string,
  image_path?: string;
  recipe_ingredient: RecipeIngredient[];
  user_id: {
    id: string,
    first_name: string,
    last_name: string,
  },
};

export type ListItem = {
  count: number;
  unit: string;
  ingredient: ApiIngredient;
  checked?: boolean;
}


export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ingredient: {
        Row: {
          category: number | null
          created_at: string
          id: number
          name: string | null
          user_id: string | null
        }
        Insert: {
          category?: number | null
          created_at?: string
          id?: number
          name?: string | null
          user_id?: string | null
        }
        Update: {
          category?: number | null
          created_at?: string
          id?: number
          name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_ingredient_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe: {
        Row: {
          category: number | null
          counter: number | null
          created_at: string
          id: number
          name: string
          steps: string[] | null
          user_id: string | null
        }
        Insert: {
          category?: number | null
          counter?: number | null
          created_at?: string
          id?: number
          name?: string
          steps?: string[] | null
          user_id?: string | null
        }
        Update: {
          category?: number | null
          counter?: number | null
          created_at?: string
          id?: number
          name?: string
          steps?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_recipe_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredient: {
        Row: {
          ingredient_id: number
          quantity: number | null
          recipe_id: number
          unit: string
        }
        Insert: {
          ingredient_id: number
          quantity?: number | null
          recipe_id: number
          unit?: string
        }
        Update: {
          ingredient_id?: number
          quantity?: number | null
          recipe_id?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_recipe_ingredient_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_recipe_ingredient_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          ingredients_ids: string | null
          last_name: string | null
          recipes_ids: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          ingredients_ids?: string | null
          last_name?: string | null
          recipes_ids?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          ingredients_ids?: string | null
          last_name?: string | null
          recipes_ids?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ingredient: {
        Row: {
          count: number | null
          ingredient_id: number
          unit: string | null
          user_id: string
        }
        Insert: {
          count?: number | null
          ingredient_id: number
          unit?: string | null
          user_id: string
        }
        Update: {
          count?: number | null
          ingredient_id?: number
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_user_ingredient_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_user_ingredient_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

