package id.guruh.taskflowai.taskmanagement.task.mapper;

import id.guruh.taskflowai.taskmanagement.task.Task;
import id.guruh.taskflowai.taskmanagement.task.dto.TaskResponse;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task){
        return TaskResponse.builder()
                .id(task.getId())
                .boardList(task.getBoardList().getId())
                .title(task.getTitle())
                .desc(task.getDesc())
                .priority(task.getPriority())
                .position(task.getPosition())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .build();
    }
}
