export type DashboardStats = {
  totalProducts: number;
  expiringToday: number;
  expiringSoon: number;
  foodSaved: number;
  wasteAvoided: number;
  receiptsScanned: number;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  duration: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: string[];
  steps: string[];
  icon: string;
};

export type FamilyMember = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
};

export type Notification = {
  id: string;
  type: 'family_invite' | 'expiring_soon' | 'expired';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  inviterName?: string;
  inviterEmail?: string;
  familyName?: string;
  inviteId?: string;
  productId?: string;
  productName?: string;
};

export type CreateNotificationPayload = Omit<Notification, 'id'>;

