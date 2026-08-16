package id.guruh.taskflowai.ai.taskmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiGeneratedRequest(
        @NotBlank(message = "Prompt tidak boleh kosong")
        @Size(max = 1000, message = "Prompt maksimal 1000 karakter")
        String prompt,

        Long boardId,
        String boardName,
        Long boardListId,
        String boardListName
) {}