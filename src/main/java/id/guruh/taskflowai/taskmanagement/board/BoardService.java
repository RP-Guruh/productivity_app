package id.guruh.taskflowai.taskmanagement.board;

import id.guruh.taskflowai.common.exception.ResourceNotFoundException;
import id.guruh.taskflowai.identity.User;
import id.guruh.taskflowai.identity.UserRepository;
import id.guruh.taskflowai.taskmanagement.board.dto.BoardRequest;
import id.guruh.taskflowai.taskmanagement.board.dto.BoardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    public List<BoardResponse> getAllByCurrentUser(String currentUserEmail) {
        User owner = getUserOrThrow(currentUserEmail);
        return boardRepository.findByOwnerId(owner.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public BoardResponse getById(Long id, String currentUserEmail) {
        User owner = getUserOrThrow(currentUserEmail);
        Board board = boardRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Board", id));
        return toResponse(board);
    }

    public BoardResponse store(BoardRequest request, String currentUserEmail) {
        User owner = getUserOrThrow(currentUserEmail);

        Board board = Board.builder()
                .title(request.getTitle())
                .owner(owner)
                .build();

        boardRepository.save(board);
        return toResponse(board);
    }


    public BoardResponse update(Long id, BoardRequest request, String currentUserEmail) {
        User owner = getUserOrThrow(currentUserEmail);
        Board board = boardRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Board", id));

        board.setTitle(request.getTitle());
        boardRepository.save(board);

        return toResponse(board);
    }

    public void destroy(Long id, String currentUserEmail) {
        User owner = getUserOrThrow(currentUserEmail);
        Board board = boardRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Board", id));

        boardRepository.delete(board);
    }

    private User getUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User tidak ditemukan"));
    }

    private BoardResponse toResponse(Board board) {
        return new BoardResponse(
                board.getId(),
                board.getTitle(),
                board.getCreatedAt()
        );
    }
}
