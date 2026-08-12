package id.guruh.taskflowai.taskmanagement.board_list.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

@Data
public class BoardListRequest {

    @NotBlank
    @Length(min=3, max=255)
    private String title;

    @NotNull
    @Positive
    private Integer position;

}
