package mk.ukim.finki.campusxp.controller;

import mk.ukim.finki.campusxp.dto.Mapper;
import mk.ukim.finki.campusxp.dto.response.FriendshipResponse;
import mk.ukim.finki.campusxp.model.Friendship;
import mk.ukim.finki.campusxp.repository.FriendshipRepository;
import mk.ukim.finki.campusxp.service.FriendshipService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/friends")
@CrossOrigin(origins = "*")
public class FriendshipController {

    private final FriendshipService friendshipService;
    private final Mapper mapper;

    public FriendshipController(FriendshipService friendshipService, Mapper mapper) {
        this.friendshipService = friendshipService;
        this.mapper = mapper;
    }

    @GetMapping("/{userId}")
    public List<FriendshipResponse> getFriends(@PathVariable Long  userId){
        return friendshipService.getFriends(userId)
                .stream()
                .map(f -> mapper.toFriendship(f, userId))
                .toList();
    }

    @PostMapping("/request")
    public FriendshipResponse sendRequest(@RequestBody FriendRequest request){
        return mapper.toFriendship(
                friendshipService.sendRequest(
                request.requesterId(),
                request.receiverId())
                ,request.requesterId()
        );
    }

    @PostMapping("/accept/{friendshipId}")
    public FriendshipResponse acceptFriendship(@PathVariable Long  friendshipId){
        return mapper.toFriendship(friendshipService.acceptRequest(friendshipId),
                friendshipService.getFriendship(friendshipId).getRequester().getId());
    }

    @PostMapping("/decline/{friendshipId}")
    public FriendshipResponse declineFriendship(@PathVariable Long  friendshipId){
        Long userId = friendshipService.getFriendship(friendshipId).getRequester().getId();
        return mapper.toFriendship(friendshipService.declineRequest(friendshipId), userId);
    }

    public record FriendRequest(
            Long requesterId,
            Long receiverId
    ){}

}
