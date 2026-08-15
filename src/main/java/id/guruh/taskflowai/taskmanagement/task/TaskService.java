package id.guruh.taskflowai.taskmanagement.task;

import id.guruh.taskflowai.taskmanagement.task.dto.TaskRequest;
import id.guruh.taskflowai.taskmanagement.task.dto.TaskResponse;
import java.util.List;

public interface TaskService {

    TaskResponse createTask(TaskRequest request); // buat task baru
    List<TaskResponse> getAllTasks(); // ambil seluruh task tanpa memperhatikan id nya
    TaskResponse getTaskById(Long id); // ambil task berdasarkan id task tersebut
    TaskResponse updateTask(Long id, TaskRequest request); // update task
    void deleteTask(Long id); // hapus task
    List<TaskResponse> findByBoardId(Long boardListId); // ambil seluruh task berdasarkan board list id nya
}
