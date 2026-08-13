package id.guruh.taskflowai.taskmanagement.board_list;

import id.guruh.taskflowai.taskmanagement.board.Board;
import id.guruh.taskflowai.taskmanagement.board.BoardRepository;
import id.guruh.taskflowai.taskmanagement.board_list.dto.BoardListRequest;
import id.guruh.taskflowai.taskmanagement.board_list.dto.BoardListResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardListService {

    private final BoardListRepository boardListRepository;
    private final BoardRepository boardRepository;

    public List<BoardListResponse> getAllByCurrentBoard(Integer currentBoardId){
       return boardListRepository.findByBoardId(currentBoardId)
               .stream()
               .map(this::toResponse)
               .toList();
    }

    public BoardListResponse store(BoardListRequest request, Long id){
        Board board = getBoardOrThrow(id);
        BoardList boardList = BoardList.builder()
                .title(request.getTitle())
                .board(board)
                .position(request.getPosition())
                .build();

        boardListRepository.save(boardList);
        return toResponse(boardList);
    }

    public BoardListResponse update(Long id, BoardListRequest request, String email) {
        BoardList boardList = boardListRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Kolom tidak ditemukan"
                ));
        boardList.setTitle(request.getTitle());
        boardList.setPosition(request.getPosition());
        boardListRepository.save(boardList);
        return toResponse(boardList);
    }

    public void destroy(Long id){
        BoardList boardList = boardListRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Kolom tidak ditemukan"
                ));
        boardListRepository.delete(boardList);
    }


    private Board getBoardOrThrow(Long id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Board tidak ditemukan"
                ));
    }


    private BoardListResponse toResponse(BoardList boardList) {
        return BoardListResponse.builder()
                .id(boardList.getId())
                .boardId(boardList.getBoard().getId())
                .title(boardList.getTitle())
                .position(boardList.getPosition())
                .build();
    }
}
