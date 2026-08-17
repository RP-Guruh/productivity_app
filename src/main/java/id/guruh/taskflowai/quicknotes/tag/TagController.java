package id.guruh.taskflowai.quicknotes.tag;

import id.guruh.taskflowai.quicknotes.tag.dto.TagRequest;
import id.guruh.taskflowai.quicknotes.tag.dto.TagResponse;
import id.guruh.taskflowai.taskmanagement.board.dto.BoardRequest;
import id.guruh.taskflowai.taskmanagement.board.dto.BoardResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quicknotes/tag")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<List<TagResponse>> getAllByCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(tagService.getAllByCurrentUser(email));
    }

    @PostMapping
    public ResponseEntity<TagResponse> store(
            @Valid @RequestBody TagRequest request,
            Authentication authentication
    ) {
        TagResponse response = tagService.store(request, authentication.getName());
        return ResponseEntity.status(201).body(response);
    }
}
