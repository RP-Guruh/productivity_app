package id.guruh.taskflowai.common.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Object id) {
        super(String.format("%s dengan id %s tidak ditemukan", resourceName, id));
    }
}