package id.guruh.taskflowai.quicknotes.tag;

import id.guruh.taskflowai.common.exception.ResourceNotFoundException;
import id.guruh.taskflowai.identity.User;
import id.guruh.taskflowai.identity.UserRepository;
import id.guruh.taskflowai.quicknotes.tag.dto.TagRequest;
import id.guruh.taskflowai.quicknotes.tag.dto.TagResponse;
import id.guruh.taskflowai.taskmanagement.board.Board;
import id.guruh.taskflowai.taskmanagement.board.dto.BoardRequest;
import id.guruh.taskflowai.taskmanagement.board.dto.BoardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    public List<TagResponse> getAllByCurrentUser(String currentUserEmail) {
        User owner = getUserOrThrow(currentUserEmail);
        return tagRepository.findByOwnerId(owner.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public TagResponse store(TagRequest request, String currentUserEmail){

        User owner = getUserOrThrow(currentUserEmail);

        Tag tag = Tag.builder()
                .name(request.getName())
                .owner(owner)
                .build();

        tagRepository.save(tag);
        return toResponse(tag);
    }


    public TagResponse update(Long id, TagRequest request, String currentUserEmail) {
        User owner = getUserOrThrow(currentUserEmail);
        Tag tag = tagRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Board", id));

        tag.setName(request.getName());
        tagRepository.save(tag);

        return toResponse(tag);
    }

    public void destroy(Long id, String currentUserEmail) {
        User owner = getUserOrThrow(currentUserEmail);
        Tag tag = tagRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Board", id));

        tagRepository.delete(tag);
    }

    private User getUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User tidak ditemukan"));
    }

    private TagResponse toResponse(Tag tag) {
        return new TagResponse(
                tag.getId(),
                tag.getName(),
                tag.getOwner().getId(),
                tag.getCreatedAt()
        );
    }
}
