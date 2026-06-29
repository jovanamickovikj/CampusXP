-- V8: Performance indexes
-- These cover the most frequent query patterns observed in the application.

-- Users: lookup by username (login, duplicate-check) and by email (login, duplicate-check)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email    ON users(email);

-- Users: admin list of pending shop managers
CREATE INDEX IF NOT EXISTS idx_users_account_type_verification
    ON users(account_type, verification_status);

-- Posts: feed / profile queries filter by user_id + archived
CREATE INDEX IF NOT EXISTS idx_posts_user_id_archived
    ON posts(user_id, archived);

-- Posts: inbox/feed for a set of users ordered by time
CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at
    ON posts(user_id, created_at DESC);

-- Friendships: both directions of lookup
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver  ON friendships(receiver_id);
-- Compound for "find friendship between two users"
CREATE INDEX IF NOT EXISTS idx_friendships_pair
    ON friendships(requester_id, receiver_id);

-- Follows: follower → list of followed shop managers
CREATE INDEX IF NOT EXISTS idx_follows_follower   ON follows(follower_id);
-- Follows: shop manager → list of followers
CREATE INDEX IF NOT EXISTS idx_follows_following  ON follows(following_id);

-- Point transactions: history per user, ordered by time
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_created
    ON point_transactions(user_id, created_at DESC);

-- Purchases: history per user
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);

-- Shop items: active listings (the common storefront query)
CREATE INDEX IF NOT EXISTS idx_shop_items_active ON shop_items(active);

-- User badges: lookup badges for a given user
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
