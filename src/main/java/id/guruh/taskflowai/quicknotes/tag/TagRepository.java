package id.guruh.taskflowai.quicknotes.tag;

import id.guruh.taskflowai.taskmanagement.board.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {
    List<Tag> findByOwnerId(Long ownerId);
    Optional<Tag> findByIdAndOwnerId(Long id, Long owner_id);

}
