package id.guruh.taskflowai.taskmanagement.board_list;

import id.guruh.taskflowai.taskmanagement.board.Board;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@Table(name = "board_lists")
@Builder
@NoArgsConstructor @AllArgsConstructor
public class BoardList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name ="board_id", nullable = false)
    private Board board;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false)
    private Integer position;

}
