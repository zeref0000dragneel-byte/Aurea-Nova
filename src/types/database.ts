export type UserRole = 'admin' | 'empleado' | 'cliente'
export type OrderStatus = 'borrador' | 'confirmado' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado'
export type PaymentStatus = 'pendiente' | 'parcial' | 'pagado'
export type MovementType = 'entrada' | 'salida' | 'ajuste' | 'merma'
export type UnitType = 'kg' | 'g' | 'l' | 'ml' | 'pza' | 'caja' | 'cubeta'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  profile_id: string | null
  business_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  rfc: string | null
  credit_days: number
  credit_limit: number
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductCategory {
  id: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  category_id: string | null
  sku: string | null
  name: string
  description: string | null
  unit: UnitType
  base_price: number
  cost_price: number
  min_stock: number
  is_active: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface CustomerPrice {
  id: string
  customer_id: string
  product_id: string
  fixed_price: number | null
  discount_pct: number | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryLot {
  id: string
  product_id: string
  lot_number: string
  production_date: string
  expiry_date: string | null
  initial_quantity: number
  current_quantity: number
  committed_quantity: number
  unit_cost: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  status: OrderStatus
  payment_status: PaymentStatus
  subtotal: number
  discount_amount: number
  total: number
  paid_amount: number
  delivery_date: string | null
  delivery_address: string | null
  notes: string | null
  confirmed_by_customer: boolean
  confirmed_by_employee: boolean
  confirmed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  lot_id: string | null
  quantity: number
  unit_price: number
  discount_pct: number
  subtotal: number
  notes: string | null
  created_at: string
}

export interface Payment {
  id: string
  order_id: string
  customer_id: string
  amount: number
  payment_method: string
  reference: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}
