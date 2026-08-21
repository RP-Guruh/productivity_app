package id.guruh.taskflowai.taskmanagement.task.impl;

import id.guruh.taskflowai.common.exception.ResourceNotFoundException;
import id.guruh.taskflowai.taskmanagement.board_list.BoardList;
import id.guruh.taskflowai.taskmanagement.board_list.BoardListRepository;
import id.guruh.taskflowai.taskmanagement.task.Task;
import id.guruh.taskflowai.taskmanagement.task.TaskRepository;
import id.guruh.taskflowai.taskmanagement.task.TaskService;
import id.guruh.taskflowai.taskmanagement.task.dto.TaskRequest;
import id.guruh.taskflowai.taskmanagement.task.dto.TaskResponse;
import id.guruh.taskflowai.taskmanagement.task.exception.DuplicatePositionException;
import id.guruh.taskflowai.taskmanagement.task.mapper.TaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final BoardListRepository boardListRepository;
    private final TaskMapper taskMapper;

    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        BoardList boardList = boardListRepository.findById(request.getBoardListId())
                .orElseThrow(() -> new ResourceNotFoundException("Board list tidak ditemukan"));

        Integer position = resolvePosition(request.getPosition(), request.getBoardListId());

        // Validasi: kalau position diisi manual dan sudah dipakai task lain, tolak
        if (request.getPosition() != null &&
                taskRepository.existsByBoardListIdAndPosition(request.getBoardListId(), position)) {
            throw new DuplicatePositionException(
                    "Position " + position + " sudah digunakan oleh task lain di list ini");
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .desc(request.getDesc())
                .priority(request.getPriority())
                .dueDate(request.getDueDate())
                .position(position)
                .boardList(boardList)
                .build();

        Task savedTask = taskRepository.save(task);
        return taskMapper.toResponse(savedTask);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(taskMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task tidak ditemukan dengan id: " + id));
        return taskMapper.toResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task tidak ditemukan dengan id: " + id));

        Long targetBoardListId = request.getBoardListId() != null ? request.getBoardListId() : task.getBoardList().getId();

        if (request.getPosition() != null &&
                taskRepository.existsByBoardListIdAndPositionAndIdNot(
                        targetBoardListId, request.getPosition(), id)) {
            throw new DuplicatePositionException(
                    "Position " + request.getPosition() + " sudah digunakan oleh task lain di list ini");
        }

        if (request.getBoardListId() != null && !request.getBoardListId().equals(task.getBoardList().getId())) {
            BoardList newBoardList = boardListRepository.findById(request.getBoardListId())
                    .orElseThrow(() -> new ResourceNotFoundException("Board list tidak ditemukan"));
            task.setBoardList(newBoardList);
        }

        task.setTitle(request.getTitle());
        task.setDesc(request.getDesc());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        if (request.getPosition() != null) {
            task.setPosition(request.getPosition());
        }

        Task updatedTask = taskRepository.save(task);
        return taskMapper.toResponse(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task tidak ditemukan dengan id: " + id);
        }
        taskRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> findByBoardId(Long boardListId) {
        return taskRepository.findByBoardListId(boardListId)
                .stream()
                .map(taskMapper::toResponse)
                .toList();

    }

    private Integer resolvePosition(Integer requestedPosition, Long boardListId) {
        if (requestedPosition != null) {
            return requestedPosition;
        }
        return taskRepository.findMaxPositionByBoardListId(boardListId)
                .map(maxPosition -> maxPosition + 1)
                .orElse(1);
    }


}
