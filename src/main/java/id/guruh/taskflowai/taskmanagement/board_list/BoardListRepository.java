package id.guruh.taskflowai.taskmanagement.board_list;

import id.guruh.taskflowai.taskmanagement.board.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BoardListRepository extends JpaRepository<BoardList, Long> {
    List<BoardList> findByBoardId(Integer boardId);

    BoardList board(Board board);
    @Query("SELECT MAX(bl.position) FROM BoardList bl WHERE bl.board.id = :boardId")
    Optional<Integer> findMaxPositionByBoardId(Long boardId);
}
