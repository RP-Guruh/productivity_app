CREATE TABLE app.boards (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    owner_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_boards_owner FOREIGN KEY (owner_id)
    REFERENCES app.users (id) ON DELETE CASCADE
);

CREATE INDEX idx_boards_owner_id ON app.boards (owner_id);