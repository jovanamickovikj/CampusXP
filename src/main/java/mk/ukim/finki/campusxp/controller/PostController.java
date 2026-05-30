package mk.ukim.finki.campusxp.controller;

import mk.ukim.finki.campusxp.dto.Mapper;
import mk.ukim.finki.campusxp.dto.response.PostResponse;
import mk.ukim.finki.campusxp.model.Post;
import mk.ukim.finki.campusxp.service.PostService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/posts")
@CrossOrigin(origins = "*")
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

    @GetMapping("/feed/{userId}")
    public List<PostResponse> getFriendsFeed(@PathVariable Long userId) {
        return postService.getFriendsFeed(userId).stream()
                .map(mapper::toPost).toList();
    }

    @PostMapping
    public PostResponse createPost(@RequestBody CreatePostRequest request) {
        return mapper.toPost(postService.createPost(
                request.userId(),
                request.title(),
                request.description(),
                request.fileUrl(),
                request.postType()
        ));
    }

    public record CreatePostRequest(
            Long userId,
            String title,
            String description,
            String fileUrl,
            Post.PostType postType
    ){}

}
