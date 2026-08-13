package id.guruh.taskflowai.taskmanagement.board_list;

import id.guruh.taskflowai.taskmanagement.board_list.dto.BoardListRequest;
import id.guruh.taskflowai.taskmanagement.board_list.dto.BoardListResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/lists")
@RequiredArgsConstructor
public class BoardListController {

    private final BoardListService boardListService;

    @GetMapping
    public ResponseEntity<List<BoardListResponse>> getAllByBoard(@PathVariable Integer boardId) {
        return ResponseEntity.ok(boardListService.getAllByCurrentBoard(boardId));
    }

    @PostMapping
    public ResponseEntity<BoardListResponse> store(
            @PathVariable Long boardId,
            @Valid @RequestBody BoardListRequest request
    ) {
        BoardListResponse response = boardListService.store(request, boardId);
        return ResponseEntity.status(201).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoardListResponse> update(
            @PathVariable Long boardId,
            @PathVariable Long id,
            @Valid @RequestBody BoardListRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(boardListService.update(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> destroy(@PathVariable Long id) {
        boardListService.destroy(id);
        return ResponseEntity.noContent().build();
    }

}
