package id.guruh.taskflowai.ai.taskmanagement;

import id.guruh.taskflowai.ai.taskmanagement.dto.AiGeneratedRequest;
import id.guruh.taskflowai.ai.taskmanagement.dto.AiGeneratedResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/tasks")
public class AiTaskManagementController {

    private final AiTaskManagementService aiTaskManagementService;

    public AiTaskManagementController(AiTaskManagementService aiTaskManagementService) {
        this.aiTaskManagementService = aiTaskManagementService;
    }

    @PostMapping("/generate")
    public ResponseEntity<AiGeneratedResponse> generate(
            @Valid @RequestBody AiGeneratedRequest request,
            Authentication authentication) {

        String currentUserEmail = authentication.getName();
        AiGeneratedResponse response = aiTaskManagementService.generate(request, currentUserEmail);
        return ResponseEntity.ok(response);
    }
}