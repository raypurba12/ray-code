export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'client';
    phone?: string | null;
    company?: string | null;
}

export interface Service {
    id: number;
    slug: string;
    title: string;
    icon: string;
    short_desc: string;
    description?: string;
    features?: string[];
    starting_price: number;
    delivery_days: number;
    is_featured?: boolean;
    sort_order?: number;
}

export interface PortfolioItem {
    id: number;
    slug: string;
    title: string;
    category: string;
    client_name: string;
    year: number;
    thumbnail_url: string | null;
    video_url?: string | null;
    gallery_urls?: string[] | null;
    description: string;
    tech_stack: string[];
    live_url?: string | null;
    is_featured?: boolean;
}

export interface PricingPlan {
    id: number;
    slug: string;
    name: string;
    tagline: string;
    price: number;
    unit: string;
    features: string[];
    is_popular: boolean;
    is_active?: boolean;
    sort_order?: number;
    cta_text: string;
}

export interface Testimonial {
    id: number;
    name: string;
    role: string;
    company: string;
    content: string;
    rating: number;
    is_approved?: boolean;
}

export interface Faq {
    id?: number;
    question: string;
    answer: string;
    category?: string;
}

export interface BlogPost {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    content?: string;
    cover_url: string | null;
    category: string;
    tags: string[] | null;
    published_at: string | null;
    author?: { id: number; name: string } | null;
}

export interface ProjectFile {
    id: number;
    file_name: string;
    disk_path: string;
    mime?: string | null;
    size: number;
    version: number;
    created_at: string;
}

export interface ProjectUpdate {
    id: number;
    title: string;
    notes?: string | null;
    created_at: string;
}

export interface Project {
    id: number;
    user_id: number;
    service_id?: number | null;
    title: string;
    requirements: string;
    specs?: Record<string, unknown> | null;
    budget: number;
    deadline?: string | null;
    status: 'pending' | 'in_review' | 'in_progress' | 'review' | 'completed' | 'cancelled';
    progress: number;
    started_at?: string | null;
    completed_at?: string | null;
    created_at: string;
    order_code?: string;
    user?: Pick<User, 'id' | 'name' | 'email'>;
    service?: Pick<Service, 'id' | 'title' | 'icon' | 'slug'> | null;
    updates?: ProjectUpdate[];
    invoices?: Invoice[];
    files?: ProjectFile[];
}

export interface Invoice {
    id: number;
    number: string;
    project_id: number;
    user_id: number;
    amount: number;
    tax: number;
    total: number;
    status: 'unpaid' | 'paid' | 'cancelled';
    snap_token?: string | null;
    payment_type?: string | null;
    payment_status?: string | null;
    due_date?: string | null;
    paid_at?: string | null;
    kind?: 'dp' | 'final' | 'full' | null;
    label?: string | null;
    created_at: string;
    project?: { id: number; title: string } | (Project & { service?: Service });
    user?: Pick<User, 'id' | 'name' | 'email' | 'company'>;
}

export interface ChatMessage {
    id: number;
    user_id: number;
    sender_role: 'client' | 'admin';
    sender_name: string;
    body: string;
    read_at?: string | null;
    created_at: string;
}

export interface ContactMessageRow {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    read_at?: string | null;
    created_at: string;
}

export interface PageProps {
    auth: { user: User | null };
    flash: { success: string | null; error: string | null };
    [key: string]: unknown;
}
