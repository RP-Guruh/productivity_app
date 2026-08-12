package id.guruh.taskflowai.taskmanagement.board_list;

import id.guruh.taskflowai.taskmanagement.board_list.dto.BoardListRequest;
import id.guruh.taskflowai.taskmanagement.board_list.dto.BoardListResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
}
