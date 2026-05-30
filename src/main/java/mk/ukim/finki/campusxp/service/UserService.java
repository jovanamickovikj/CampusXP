package mk.ukim.finki.campusxp.service;

import mk.ukim.finki.campusxp.exception.BadRequestException;
import mk.ukim.finki.campusxp.exception.ResourceNotFoundException;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public User findById(Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User findByUsername(String username){
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }

    public User createUser(String username, String email, String fullname, User.Role role){
        if(userRepository.existsByUsername(username)){
            throw new BadRequestException("Username already exists");
        }
        if(userRepository.existsByEmail(email)){
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setFullName(fullname);
        user.setRole(role);

        userRepository.save(user);
        return user;
    }

    public void spendPoints(Long userId, Integer points){
        User user = findById(userId);
        if(user.getCurrentPoints() < points){
            throw new BadRequestException("Not enough points");
        }
        user.setCurrentPoints(user.getCurrentPoints() - points);
        userRepository.save(user);
    }

    public void addPoints(Long userId, Integer points){
        User user = findById(userId);
        user.setCurrentPoints(user.getCurrentPoints() + points);
        user.setTotalEarnedPoints(user.getTotalEarnedPoints() + points);
        userRepository.save(user);
    }
}
