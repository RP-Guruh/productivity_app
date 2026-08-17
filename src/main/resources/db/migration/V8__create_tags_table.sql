CREATE TABLE notes.tags (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_tag_owner FOREIGN KEY (owner_id)
    REFERENCES app.users (id) ON DELETE CASCADE
);
