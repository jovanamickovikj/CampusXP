package mk.ukim.finki.campusxp.config;

import mk.ukim.finki.campusxp.model.Badge;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.service.BadgeService;
import mk.ukim.finki.campusxp.service.ShopService;
import mk.ukim.finki.campusxp.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;
    private final BadgeService badgeService;
    private final ShopService shopService;

    public DataInitializer(UserService userService, BadgeService badgeService, ShopService shopService) {
        this.userService = userService;
        this.badgeService = badgeService;
        this.shopService = shopService;
    }

    @Override
    public void run(String... args) throws Exception {
        userService.createUser("jovana", "jovana@finki.ukim.mk", "Jovana Mickovikj", User.Role.STUDENT);
        userService.createUser("prof_stefan", "stefan@finki.ukim.mk", "Stefan Sotirovski", User.Role.PROFESSOR);
        userService.createUser("elena", "elena@finki.ukim.mk", "Elena Mickovikj", User.Role.STUDENT);

        badgeService.createBadge("First Upload", "Uploaded your first document", "/icons/first-upload.png", Badge.BadgeType.ACTIVITY);
        badgeService.createBadge("Social Butterfly", "Added 5 friends", "/icons/social.png", Badge.BadgeType.SOCIAL);

        shopService.createItem("Campus Hoodie", "Official CampusXP hoodie", "/images/hoodie.png", 500, 10);
        shopService.createItem("Library Priority Pass", "Skip the queue at the library", "/images/pass.png", 200, 20);
        shopService.createItem("Cafeteria Voucher", "Free lunch voucher", "/images/voucher.png", 150, 50);
    }
}
