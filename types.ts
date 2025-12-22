export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
  file_path?: string; 
  tags?: string[];
  youtube_url?: string;
  download_label_main?: string;
  download_label_extras?: string;
  download_label_bonus?: string;
}

export interface ProductFile {
  id: string;
  product_id: string;
  file_path: string;
  file_name: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  id: string;
  email: string;
  is_admin: boolean;
  full_name?: string;
  avatar_url?: string;
}

export interface Order {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  total: number;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  product: Product;
  price_at_purchase: number;
}

export interface SiteConfig {
  id: string;
  logo_url: string | null;
  facebook_pixel_id: string | null;
  facebook_pixel_token: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  instagram_url: string | null;
  whatsapp_number: string | null;
  whatsapp_group_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_bg_image: string | null;
  top_banner_text: string | null;
  mercadopago_public_key: string | null;
  mercadopago_access_token: string | null;
}

export interface SiteSection {
  id: string;
  type: 'hero' | 'products' | 'content' | 'about' | 'features' | 'banner';
  layout: 'content-left' | 'content-right' | 'centered';
  title: string;
  content: string;
  image_url: string | null;
  is_visible: boolean;
  display_order: number;
  filter_tag?: string | null;
}