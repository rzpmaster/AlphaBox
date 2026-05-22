export type User = {
  id: number;
  email: string;
  display_name: string;
  role: "user" | "leader" | "admin";
  is_active: boolean;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export type Leader = {
  id: number;
  user_id: number;
  handle: string;
  headline: string;
  bio: string;
  strategy: string;
  risk_level: string;
  subscription_price: string;
  monthly_price: string;
  yearly_price: string;
  is_verified: boolean;
  is_published: boolean;
  created_at: string;
};

export type Subscription = {
  id: number;
  user_id: number;
  leader_id: number;
  amount: string;
  status: "pending" | "paid" | "cancelled" | "expired";
  billing_period: "monthly" | "yearly";
  paid_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type SubscriptionWithLeader = {
  subscription: Subscription;
  leader: Leader;
};

export type Post = {
  id: number;
  leader_id: number;
  title: string;
  body: string;
  created_at: string;
};

export type Signal = {
  id: number;
  leader_id: number;
  symbol: string;
  code: string | null;
  side: "long" | "short" | "watch";
  thesis: string;
  entry: string | null;
  target: string | null;
  stop_loss: string | null;
  timeframe: string;
  is_archived: boolean;
  exit_price: string | null;
  return_rate: string | null;
  archived_at: string | null;
  created_at: string;
};

export type FeedItem =
  | { type: "post"; created_at: string; leader: Leader; item: Post }
  | { type: "signal"; created_at: string; leader: Leader; item: Signal };

export type InvitationCode = {
  id: number;
  code: string;
  created_by_id: number | null;
  used_by_id: number | null;
  used_at: string | null;
  created_at: string;
  is_used: boolean;
  used_by_name: string | null;
};

export type AdminUser = User & {
  following_count: number;
  follower_count: number;
  leader_id: number | null;
  leader_is_verified: boolean;
};

export type AdminSubscription = {
  subscription: Subscription;
  leader: Leader;
  user: User;
};
