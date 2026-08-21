package id.guruh.taskflowai.taskmanagement.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByBoardListId(Long boardListId);
    @Query("SELECT MAX(t.position) FROM Task t WHERE t.boardList.id = :boardListId")
    Optional<Integer> findMaxPositionByBoardListId(@Param("boardListId") Long boardListId);
    boolean existsByBoardListIdAndPosition(Long boardListId, Integer position);
    boolean existsByBoardListIdAndPositionAndIdNot(Long boardListId, Integer position, Long id);

}
