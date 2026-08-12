package id.guruh.taskflowai.taskmanagement.board;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByOwnerId(Long ownerId);
    Optional<Board> findByIdAndOwnerId(Long id, Long owner_id);
}
