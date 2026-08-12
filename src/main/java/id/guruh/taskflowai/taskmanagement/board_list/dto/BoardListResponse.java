package id.guruh.taskflowai.taskmanagement.board_list.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardListResponse {
    private Long id;
    private Long boardId;
    private String title;
    private Integer position;
}
