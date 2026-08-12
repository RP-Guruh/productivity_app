package id.guruh.taskflowai.taskmanagement.board;

import id.guruh.taskflowai.taskmanagement.board.dto.BoardRequest;
import id.guruh.taskflowai.taskmanagement.board.dto.BoardResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @GetMapping
    public ResponseEntity<List<BoardResponse>> getAllByCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(boardService.getAllByCurrentUser(email));
    }

    @PostMapping
    public ResponseEntity<BoardResponse> store(
            @Valid @RequestBody BoardRequest request,
            Authentication authentication
    ) {
        BoardResponse response = boardService.store(request, authentication.getName());
        return ResponseEntity.status(201).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoardResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody BoardRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(boardService.update(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> destroy(@PathVariable Long id, Authentication authentication) {
        boardService.destroy(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }




}
