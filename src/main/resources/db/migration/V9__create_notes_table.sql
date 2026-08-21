CREATE TABLE notes.notes (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_note_owner FOREIGN KEY (owner_id)
    REFERENCES app.users (id) ON DELETE CASCADE
);

CREATE INDEX idx_note_owner_id ON notes.notes (owner_id);