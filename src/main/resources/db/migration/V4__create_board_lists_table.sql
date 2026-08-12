CREATE TABLE app.board_lists (
    id BIGSERIAL PRIMARY KEY,
    board_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_board_lists_board FOREIGN KEY (board_id)
    REFERENCES app.boards (id) ON DELETE CASCADE
);

CREATE INDEX idx_board_lists_board_id ON app.board_lists (board_id);