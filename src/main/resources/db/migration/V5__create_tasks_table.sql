CREATE TABLE app.tasks (
    id BIGSERIAL PRIMARY KEY,
    list_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'low',
    due_date DATE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_tasks_list FOREIGN KEY (list_id)
    REFERENCES app.board_lists (id) ON DELETE CASCADE,
    CONSTRAINT chk_tasks_priority CHECK (priority IN ('low', 'medium', 'high'))
);

CREATE INDEX idx_tasks_list_id ON app.tasks (list_id);