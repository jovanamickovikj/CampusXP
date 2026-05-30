package mk.ukim.finki.campusxp.service;

import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaderboardService {

    private final UserRepository userRepository;

    public LeaderboardService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getLeaderboard() {
        return userRepository.findAllByOrderByTotalEarnedPointsDesc();
    }
}
