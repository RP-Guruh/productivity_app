package id.guruh.taskflowai.taskmanagement.task.dto;

import id.guruh.taskflowai.taskmanagement.task.enums.PriorityLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskResponse {
    private Long id;
    private Long boardList;
    private String title;
    private String desc;
    private java.time.LocalDate dueDate;
    private PriorityLevel priority;
    private Integer position;
    private LocalDateTime createdAt;
}
