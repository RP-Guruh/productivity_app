package id.guruh.taskflowai.taskmanagement.board_list;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardListRepository extends JpaRepository<BoardList, Long> {
    List<BoardList> findByBoardId(Integer boardId);
}
