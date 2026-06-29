-- ============================================================
-- V1__init.sql  –  CampusXP initial schema (PostgreSQL)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id                  BIGSERIAL PRIMARY KEY,
    username            VARCHAR(50)  NOT NULL UNIQUE,
    email               VARCHAR(255) NOT NULL UNIQUE,
    full_name           VARCHAR(255) NOT NULL,
    password            VARCHAR(255) NOT NULL,
    avatar_url          VARCHAR(512),
    current_points      INT          NOT NULL DEFAULT 0,
    total_earned_points INT          NOT NULL DEFAULT 0,
    role                VARCHAR(20)  NOT NULL DEFAULT 'USER'
);

CREATE TABLE IF NOT EXISTS badges (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    icon_url    VARCHAR(512),
    type        VARCHAR(50)  NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
    id        BIGSERIAL PRIMARY KEY,
    user_id   BIGINT       NOT NULL REFERENCES users(id),
    badge_id  BIGINT       NOT NULL REFERENCES badges(id),
    earned_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS posts (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     VARCHAR(2000),
    file_url        VARCHAR(512),
    post_type       VARCHAR(20)  NOT NULL,
    points_awarded  INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    user_id         BIGINT       NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS friendships (
    id           BIGSERIAL PRIMARY KEY,
    requester_id BIGINT      NOT NULL REFERENCES users(id),
    receiver_id  BIGINT      NOT NULL REFERENCES users(id),
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_items (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(200) NOT NULL,
    description  VARCHAR(1000),
    image_url    VARCHAR(512),
    price_points INT          NOT NULL,
    quantity     INT          NOT NULL DEFAULT 0,
    active       BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS purchases (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT    NOT NULL REFERENCES users(id),
    shop_item_id BIGINT    NOT NULL REFERENCES shop_items(id),
    points_paid  INT       NOT NULL,
    purchased_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS point_transactions (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users(id),
    amount     INT          NOT NULL,
    type       VARCHAR(20)  NOT NULL,
    reason     VARCHAR(500),
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_user_id      ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at   ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_req    ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_rec    ON friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_pt_user_id         ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id  ON purchases(user_id);
