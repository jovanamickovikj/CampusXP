package mk.ukim.finki.campusxp.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import mk.ukim.finki.campusxp.dto.Mapper;
import mk.ukim.finki.campusxp.dto.response.PostResponse;
import mk.ukim.finki.campusxp.model.Post;
import mk.ukim.finki.campusxp.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final Mapper mapper;

    public PostController(PostService postService, Mapper mapper) {
        this.postService = postService;
        this.mapper = mapper;
    }

    @GetMapping("/user/{userId}")
    public List<PostResponse> getUserPosts(@PathVariable Long userId) {
        return postService.getPostsForUser(userId)
                .stream().map(mapper::toPost).toList();
    }

    @GetMapping("/user/{userId}/archived")
    public List<PostResponse> getArchivedPosts(@PathVariable Long userId) {
        return postService.getArchivedPostsForUser(userId)
                .stream().map(mapper::toPost).toList();
    }

    @GetMapping("/feed/{userId}")
    public List<PostResponse> getFriendsFeed(@PathVariable Long userId) {
        return postService.getFriendsFeed(userId).stream()
                .map(mapper::toPost).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse createPost(@Valid @RequestBody CreatePostRequest request) {
        return mapper.toPost(postService.createPost(
                request.userId(),
                request.title(),
                request.description(),
                request.fileUrl(),
                request.postType()
        ));
    }

    @PutMapping("/{id}")
    public PostResponse updatePost(@PathVariable Long id, @Valid @RequestBody UpdatePostRequest request) {
        return mapper.toPost(
                postService.updatePost(id, request.requestingUserId(),
                        request.title(), request.description(), request.fileUrl()));
    }

    @PutMapping("/{id}/archive")
    public PostResponse archivePost(@PathVariable Long id, @RequestParam Long requestingUserId) {
        return mapper.toPost(postService.archivePost(id, requestingUserId));
    }

    @PutMapping("/{id}/unarchive")
    public PostResponse unarchivePost(@PathVariable Long id, @RequestParam Long requestingUserId) {
        return mapper.toPost(postService.unarchivePost(id, requestingUserId));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(@PathVariable Long id, @RequestParam Long requestingUserId) {
        postService.deletePost(id, requestingUserId);
    }

    // ── Request records ───────────────────────────────────────────────────────

    public record CreatePostRequest(
            @NotNull(message = "userId is required") Long userId,
            @NotBlank(message = "Title is required") @Size(max = 200, message = "Title must not exceed 200 characters") String title,
            @Size(max = 500, message = "Description must not exceed 500 characters") String description,
            String fileUrl,
            @NotNull(message = "Post type is required") Post.PostType postType
    ) {}

    public record UpdatePostRequest(
            @NotNull(message = "requestingUserId is required") Long requestingUserId,
            @Size(max = 200, message = "Title must not exceed 200 characters") String title,
            @Size(max = 500, message = "Description must not exceed 500 characters") String description,
            String fileUrl
    ) {}
}
