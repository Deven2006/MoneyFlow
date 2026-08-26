// src/types/index.ts

export interface AccountItem {
  id: string;
  name: string;
  type: string;
  initialBalance?: number | string | any;
  balance?: number;
  color?: string | null;
  icon?: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color?: string | null;
}