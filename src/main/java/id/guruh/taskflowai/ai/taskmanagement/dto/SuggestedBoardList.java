package id.guruh.taskflowai.ai.taskmanagement.dto;

import java.util.List;

public record SuggestedBoardList(
        String name,
        String description,
        List<SuggestedTask> tasks
) {}
