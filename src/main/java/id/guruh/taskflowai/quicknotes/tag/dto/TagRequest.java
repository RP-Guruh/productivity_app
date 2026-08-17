package id.guruh.taskflowai.quicknotes.tag.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TagRequest {

    @NotBlank
    @Max(20)
    private String name;

}
