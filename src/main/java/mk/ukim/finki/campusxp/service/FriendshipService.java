package mk.ukim.finki.campusxp.service;

import mk.ukim.finki.campusxp.exception.BadRequestException;
import mk.ukim.finki.campusxp.exception.ResourceNotFoundException;
import mk.ukim.finki.campusxp.model.Friendship;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.repository.FriendshipRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FriendshipService {

    private final FriendshipRepository  friendshipRepository;
    private final UserService userService;

    public FriendshipService(FriendshipRepository friendshipRepository, UserService userService) {
        this.friendshipRepository = friendshipRepository;
        this.userService = userService;
    }

    public Friendship sendRequest(Long requesterId, Long receiverId){

        if(requesterId.equals(receiverId))
            throw new BadRequestException("You can not send request to yourself");

        if(friendshipRepository.findByRequesterAndReceiver(requesterId,receiverId).isPresent())
            throw new BadRequestException("Friendship already exists");

        User requester = userService.findById(requesterId);
        User receiver = userService.findById(receiverId);
        Friendship friendship = new Friendship();
        friendship.setRequester(requester);
        friendship.setReceiver(receiver);
        friendshipRepository.save(friendship);
        return friendship;
    }

    public Friendship acceptRequest(Long friendshipId){
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship not found"));
        friendship.setStatus(Friendship.Status.ACCEPTED);
        return friendshipRepository.save(friendship);
    }

    public Friendship declineRequest(Long friendshipId){
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship not found"));
        friendshipRepository.delete(friendship);
        return friendship;
    }

    public List<Friendship> getFriends(Long userId){
        return friendshipRepository.findAcceptedFriendships(userId);
    }

    public Friendship getFriendship(Long friendshipId){
        return friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship not found"));
    }
}
