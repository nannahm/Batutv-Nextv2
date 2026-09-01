export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  articleCount?: number;
}

export interface CategoryActionResult {
  success: boolean;
  message: string;
  categoryId?: string;
  errors?: Record<string, string[]>;
  data?: CategoryItem | null;
}
