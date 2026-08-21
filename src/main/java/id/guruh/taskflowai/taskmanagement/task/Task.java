package id.guruh.taskflowai.taskmanagement.task;

import id.guruh.taskflowai.taskmanagement.board_list.BoardList;
import id.guruh.taskflowai.taskmanagement.task.enums.PriorityLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name="tasks")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private BoardList boardList;

    @Column(nullable = false, name = "description", columnDefinition = "TEXT")
    private String desc;

    @Column(nullable = false)
    private String title;

    @Convert(converter = id.guruh.taskflowai.taskmanagement.task.enums.PriorityLevelConverter.class)
    @Column(nullable = false)
    private PriorityLevel priority;

    @Column(name = "due_date")
    private java.time.LocalDate dueDate;

    private Integer position;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
