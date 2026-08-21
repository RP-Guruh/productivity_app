package id.guruh.taskflowai.taskmanagement.task.dto;

import id.guruh.taskflowai.taskmanagement.task.enums.PriorityLevel;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskRequest {

    @NotNull
    private Long boardListId;

    @NotBlank
    private String title;

    @NotBlank
    private String desc;

    @NotNull
    private PriorityLevel priority;

    @FutureOrPresent
    private java.time.LocalDate dueDate;

    @Positive
    private Integer position;

}
