package id.guruh.taskflowai.ai.taskmanagement.dto;

import id.guruh.taskflowai.taskmanagement.task.enums.PriorityLevel;

import java.time.LocalDate;

public record SuggestedTask(
                String title,
                String description,
                PriorityLevel priority,
                LocalDate dueDate) {
}