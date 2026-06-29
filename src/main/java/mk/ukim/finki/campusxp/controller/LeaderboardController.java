package mk.ukim.finki.campusxp.controller;

import mk.ukim.finki.campusxp.dto.Mapper;
import mk.ukim.finki.campusxp.dto.response.UserSummaryResponse;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.service.LeaderboardService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final Mapper mapper;

    public LeaderboardController(LeaderboardService leaderboardService, Mapper mapper) {
        this.leaderboardService = leaderboardService;
        this.mapper = mapper;
    }

    @GetMapping
    public List<UserSummaryResponse> getLeaderboard() {
        return leaderboardService.getLeaderboard()
                .stream()
                .map(mapper::toUserSummary)
                .toList();
    }
}
