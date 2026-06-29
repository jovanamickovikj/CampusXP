-- Follows: regular users follow shop managers.
-- Completely separate from the friendship table (no reuse of that relationship).
CREATE TABLE IF NOT EXISTS follows (
    id          BIGSERIAL PRIMARY KEY,
    follower_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_follow UNIQUE (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower  ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
