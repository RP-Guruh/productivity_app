package id.guruh.taskflowai.taskmanagement.board.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

@Data
public class BoardRequest {

    @NotBlank
    @Length(min = 3, max = 255)
    private String title;
}
