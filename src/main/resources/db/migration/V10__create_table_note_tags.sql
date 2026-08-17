CREATE TABLE notes.note_tags (
    note_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    CONSTRAINT fk_note_tags_note FOREIGN KEY (note_id)
    REFERENCES notes.notes (id) ON DELETE CASCADE,
    CONSTRAINT fk_note_tags_tag FOREIGN KEY (tag_id)
    REFERENCES notes.tags (id) ON DELETE CASCADE
);

CREATE INDEX idx_note_tags_tag_id ON notes.note_tags (tag_id);