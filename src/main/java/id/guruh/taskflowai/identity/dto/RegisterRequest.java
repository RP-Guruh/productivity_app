package id.guruh.taskflowai.identity.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Nama wajib diisi")
    private String name;

    @NotBlank(message = "Email wajib diisi")
    @Email(message = "Format email tidak valid")
    private String email;

    @NotBlank(message = "Password wajib diisi")
    @Size(min = 8, message = "Password minimal 8 karakter")
    private String password;
}