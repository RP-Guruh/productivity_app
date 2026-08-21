package id.guruh.taskflowai.ai.taskmanagement.dto;

import java.util.List;

public record AiGeneratedResponse(
        String intentSummary,
        List<SuggestedBoardList> boardLists,
        List<SuggestedTask> tasks
) {}