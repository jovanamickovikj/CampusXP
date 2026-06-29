package mk.ukim.finki.campusxp.config;

import mk.ukim.finki.campusxp.model.Badge;
import mk.ukim.finki.campusxp.model.Post;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.repository.UserRepository;
import mk.ukim.finki.campusxp.service.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the database with realistic demo data on every clean startup.
 *
 * Demo credentials (all students use "password123", admin uses "admin123"):
 *   jovana / password123       — 850 XP
 *   marija / password123       — 1200 XP
 *   kristina / password123     — 960 XP
 *   ana / password123          — 780 XP
 *   nikola / password123       — 690 XP
 *   elena / password123        — 620 XP
 *   milena / password123       — 510 XP
 *   aleksandar / password123   — 320 XP
 *   filip / password123        — 240 XP
 *   bojan / password123        — 150 XP
 *   stefan / password123       — 430 XP
 *   admin / admin123           — ADMIN
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserService userService;
    private final BadgeService badgeService;
    private final ShopService shopService;
    private final PostService postService;
    private final FriendshipService friendshipService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           UserService userService,
                           BadgeService badgeService,
                           ShopService shopService,
                           PostService postService,
                           FriendshipService friendshipService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository    = userRepository;
        this.userService       = userService;
        this.badgeService      = badgeService;
        this.shopService       = shopService;
        this.postService       = postService;
        this.friendshipService = friendshipService;
        this.passwordEncoder   = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        String pw      = passwordEncoder.encode("password123");
        String adminPw = passwordEncoder.encode("admin123");

        // ─── Users ───────────────────────────────────────────────────────────
        User jovana      = createUser("jovana",      "jovana@finki.ukim.mk",      "Jovana Mickovikj",       pw,      User.Role.USER,  850,  "https://api.dicebear.com/7.x/avataaars/svg?seed=jovana");
        User marija      = createUser("marija",      "marija@finki.ukim.mk",      "Marija Dimitrova",       pw,      User.Role.USER, 1200,  "https://api.dicebear.com/7.x/avataaars/svg?seed=marija");
        User kristina    = createUser("kristina",    "kristina@finki.ukim.mk",    "Kristina Georgievska",   pw,      User.Role.USER,  960,  "https://api.dicebear.com/7.x/avataaars/svg?seed=kristina");
        User ana         = createUser("ana",         "ana@finki.ukim.mk",         "Ana Todorovska",         pw,      User.Role.USER,  780,  "https://api.dicebear.com/7.x/avataaars/svg?seed=ana");
        User nikola      = createUser("nikola",      "nikola@finki.ukim.mk",      "Nikola Ristevski",       pw,      User.Role.USER,  690,  "https://api.dicebear.com/7.x/avataaars/svg?seed=nikola");
        User elena       = createUser("elena",       "elena@finki.ukim.mk",       "Elena Petrovska",        pw,      User.Role.USER,  620,  "https://api.dicebear.com/7.x/avataaars/svg?seed=elena");
        User milena      = createUser("milena",      "milena@finki.ukim.mk",      "Milena Kostadinova",     pw,      User.Role.USER,  510,  "https://api.dicebear.com/7.x/avataaars/svg?seed=milena");
        User stefan      = createUser("stefan",      "stefan@finki.ukim.mk",      "Stefan Nikolovski",      pw,      User.Role.USER,  430,  "https://api.dicebear.com/7.x/avataaars/svg?seed=stefan");
        User aleksandar  = createUser("aleksandar",  "aleks@finki.ukim.mk",       "Aleksandar Stojanovski", pw,      User.Role.USER,  320,  "https://api.dicebear.com/7.x/avataaars/svg?seed=aleksandar");
        User filip       = createUser("filip",       "filip@finki.ukim.mk",       "Filip Blazevski",        pw,      User.Role.USER,  240,  "https://api.dicebear.com/7.x/avataaars/svg?seed=filip");
        User bojan       = createUser("bojan",       "bojan@finki.ukim.mk",       "Bojan Trajkovski",       pw,      User.Role.USER,  150,  "https://api.dicebear.com/7.x/avataaars/svg?seed=bojan");
        User admin       = createUser("admin",       "admin@campusxp.mk",         "CampusXP Admin",         adminPw, User.Role.ADMIN,   0,  "https://api.dicebear.com/7.x/avataaars/svg?seed=admin");
        Long adminId = admin.getId();

        // ─── Badges ──────────────────────────────────────────────────────────
        Badge firstPost   = badgeService.createBadge("First Post",        "Shared your first post on CampusXP",          "https://cdn-icons-png.flaticon.com/128/1048/1048953.png", Badge.BadgeType.ACTIVITY);
        Badge socialBfly  = badgeService.createBadge("Social Butterfly",  "Connected with 5 or more friends on campus",  "https://cdn-icons-png.flaticon.com/128/1728/1728782.png", Badge.BadgeType.SOCIAL);
        Badge academicStr = badgeService.createBadge("Academic Star",     "Uploaded an academic document",               "https://cdn-icons-png.flaticon.com/128/3976/3976626.png", Badge.BadgeType.ACADEMIC);
        Badge legend      = badgeService.createBadge("Campus Legend",     "Reached 500 total XP",                        "https://cdn-icons-png.flaticon.com/128/1828/1828884.png", Badge.BadgeType.SPECIAL);
        Badge uploader    = badgeService.createBadge("Content Creator",   "Uploaded your first image or video post",     "https://cdn-icons-png.flaticon.com/128/3135/3135789.png", Badge.BadgeType.ACTIVITY);
        Badge shopaholic  = badgeService.createBadge("Shopper",           "Made your first purchase in the campus shop", "https://cdn-icons-png.flaticon.com/128/3081/3081559.png", Badge.BadgeType.SPECIAL);

        // ─── Award badges ─────────────────────────────────────────────────────
        badgeService.awardBadge(marija.getId(),   firstPost.getId());
        badgeService.awardBadge(marija.getId(),   socialBfly.getId());
        badgeService.awardBadge(marija.getId(),   academicStr.getId());
        badgeService.awardBadge(marija.getId(),   legend.getId());
        badgeService.awardBadge(marija.getId(),   uploader.getId());

        badgeService.awardBadge(kristina.getId(), firstPost.getId());
        badgeService.awardBadge(kristina.getId(), legend.getId());
        badgeService.awardBadge(kristina.getId(), academicStr.getId());

        badgeService.awardBadge(jovana.getId(),   firstPost.getId());
        badgeService.awardBadge(jovana.getId(),   socialBfly.getId());
        badgeService.awardBadge(jovana.getId(),   legend.getId());

        badgeService.awardBadge(ana.getId(),      firstPost.getId());
        badgeService.awardBadge(ana.getId(),      uploader.getId());

        badgeService.awardBadge(nikola.getId(),   firstPost.getId());
        badgeService.awardBadge(nikola.getId(),   academicStr.getId());

        badgeService.awardBadge(elena.getId(),    firstPost.getId());
        badgeService.awardBadge(stefan.getId(),   firstPost.getId());
        badgeService.awardBadge(stefan.getId(),   shopaholic.getId());

        // ─── Shop items — all created by admin ───────────────────────────────
        shopService.createItem(adminId, "Campus Hoodie",
                "Official CampusXP hoodie — wear your XP with pride. Available in sizes S–XXL.",
                "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=300&fit=crop", 500, 10);
        shopService.createItem(adminId, "Library Priority Pass",
                "Skip the queue and get a reserved study room at the library for one full week.",
                "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=300&fit=crop", 200, 20);
        shopService.createItem(adminId, "Cafeteria Voucher",
                "Free lunch voucher valid at the main cafeteria — choice of daily special.",
                "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop", 150, 50);
        shopService.createItem(adminId, "Parking Permit",
                "Reserved parking spot near the main entrance for one full month.",
                "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&h=300&fit=crop", 350, 5);
        shopService.createItem(adminId, "Course Notes Bundle",
                "Premium handwritten and typed notes from top-performing students, for any course.",
                "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop", 100, 100);
        shopService.createItem(adminId, "Exam Cheat Sheet",
                "One A4 allowed-notes sheet for any open-book exam — pre-formatted and laminated.",
                "https://images.unsplash.com/photo-1546198632-9ef6368bef12?w=400&h=300&fit=crop", 80, 200);
        shopService.createItem(adminId, "CampusXP Backpack",
                "Premium laptop backpack with CampusXP branding, USB charging port and 30L capacity.",
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop", 750, 8);
        shopService.createItem(adminId, "Wireless Earbuds",
                "Noise-cancelling earbuds, perfect for studying or commuting to campus.",
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop", 600, 3);
        shopService.createItem(adminId, "Coffee & Study Kit",
                "A bag of premium coffee + a CampusXP branded mug. Fuel for late-night sessions.",
                "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop", 120, 30);
        shopService.createItem(adminId, "Printing Credits",
                "200 pages of free printing at any campus printer. No expiry.",
                "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop", 90, 500);
        shopService.createItem(adminId, "Tutor Session (1h)",
                "One hour of tutoring from a verified senior student in your subject area.",
                "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop", 250, 15);
        shopService.createItem(adminId, "Movie Night Ticket",
                "Ticket to the monthly campus movie night at the lecture hall. Popcorn included.",
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop", 60, 100);
        shopService.createItem(adminId, "Gym Day Pass",
                "One-day access to the campus gym and sports facilities.",
                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop", 40, 200);
        shopService.createItem(adminId, "CampusXP Water Bottle",
                "Insulated stainless steel water bottle with CampusXP logo, 500ml.",
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop", 110, 40);
        shopService.createItem(adminId, "Mental Health Wellness Pack",
                "Stress-relief kit: herbal tea, journaling notebook, and a 30-min counselling voucher.",
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop", 180, 25);
        shopService.createItem(adminId, "Campus T-Shirt",
                "Soft cotton CampusXP T-shirt. Available in multiple colors and all sizes.",
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop", 200, 50);
        shopService.createItem(adminId, "Sticker Pack",
                "Set of 20 CampusXP stickers — laptops, water bottles and phone cases approved.",
                "https://images.unsplash.com/photo-1584803267086-9c65cf3eb459?w=400&h=300&fit=crop", 30, 1000);
        shopService.createItem(adminId, "VIP Graduation Photo Session",
                "Professional graduation photo session with a campus photographer. Digital + printed copies.",
                "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop", 900, 5);

        // ─── Posts ───────────────────────────────────────────────────────────
        postService.createPost(marija.getId(),
                "Machine Learning Assignment — Neural Network from Scratch",
                "Built a 3-layer neural network using only NumPy. Achieved 94% accuracy on MNIST. Sharing my implementation notes.",
                "https://picsum.photos/seed/ml1/600/400", Post.PostType.DOCUMENT);
        postService.createPost(marija.getId(),
                "Study Group Session — Algorithms & Data Structures",
                "Great session today! We tackled dynamic programming together. If anyone wants the problem set, DM me.",
                null, Post.PostType.TEXT);
        postService.createPost(marija.getId(),
                "Campus Sunset",
                "The view from the engineering building rooftop at golden hour.",
                "https://picsum.photos/seed/sunset1/600/400", Post.PostType.IMAGE);
        postService.createPost(marija.getId(),
                "Research Paper: AI in Education",
                "Finished my literature review on adaptive learning systems. Sharing for peer feedback.",
                "https://picsum.photos/seed/paper1/600/400", Post.PostType.DOCUMENT);

        postService.createPost(kristina.getId(),
                "Database Systems — ER Diagram for Hospital Management",
                "Final project ER diagram for our database systems course. Used PostgreSQL + Spring Boot.",
                "https://picsum.photos/seed/db1/600/400", Post.PostType.IMAGE);
        postService.createPost(kristina.getId(),
                "Finals Week Survival Tips",
                "1. Sleep 7h minimum. 2. Pomodoro technique works. 3. Group study beats solo. 4. Teach concepts to explain them.",
                null, Post.PostType.TEXT);
        postService.createPost(kristina.getId(),
                "Software Engineering — UML Diagrams",
                "Class diagrams, sequence diagrams, and use case diagrams for our e-commerce project. Clean Architecture applied.",
                "https://picsum.photos/seed/uml1/600/400", Post.PostType.DOCUMENT);

        postService.createPost(jovana.getId(),
                "Introduction to Computer Vision",
                "Started learning OpenCV this week. Image segmentation is fascinating. Here are my first experiments.",
                "https://picsum.photos/seed/cv1/600/400", Post.PostType.IMAGE);
        postService.createPost(jovana.getId(),
                "Operating Systems — Process Scheduling Demo",
                "Implemented Round Robin, FCFS and SJF scheduling algorithms in C. Tested with 50-process simulations.",
                null, Post.PostType.DOCUMENT);
        postService.createPost(jovana.getId(),
                "Library Discoveries",
                "Found some incredible books in the fourth-floor stacks that aren't in the digital catalog. Ask me which ones.",
                null, Post.PostType.TEXT);

        postService.createPost(ana.getId(),
                "Math Study Session Highlights",
                "Spent 4 hours on linear algebra. Eigenvalues finally clicked. Here's the visual explanation that helped me.",
                "https://picsum.photos/seed/math1/600/400", Post.PostType.IMAGE);
        postService.createPost(ana.getId(),
                "Web Development Project — Campus Event Platform",
                "React + Spring Boot final project. Implemented user auth, event CRUD and real-time notifications.",
                "https://picsum.photos/seed/web1/600/400", Post.PostType.DOCUMENT);

        postService.createPost(nikola.getId(),
                "Networking Lab — Packet Analysis with Wireshark",
                "Captured and analyzed TCP handshakes, DNS queries and HTTP traffic. Wireshark filters are incredibly powerful.",
                "https://picsum.photos/seed/net1/600/400", Post.PostType.IMAGE);
        postService.createPost(nikola.getId(),
                "Best Study Playlist",
                "Lo-fi beats + no interruptions = 6h of pure focus. Sharing the YouTube link below.",
                null, Post.PostType.TEXT);

        postService.createPost(elena.getId(),
                "Internship Experience at Seavus",
                "Just finished my 3-month internship. Key takeaways: code review culture, Agile sprints, and imposter syndrome is real.",
                null, Post.PostType.TEXT);
        postService.createPost(elena.getId(),
                "Mobile Development — Android App Prototype",
                "First Android app built from scratch using Jetpack Compose. Campus map + room booking feature.",
                "https://picsum.photos/seed/android1/600/400", Post.PostType.IMAGE);

        postService.createPost(stefan.getId(),
                "Cybersecurity CTF Competition Results",
                "Our team finished 3rd in the national CTF competition! Solved 12 challenges in web exploitation and cryptography.",
                "https://picsum.photos/seed/ctf1/600/400", Post.PostType.IMAGE);
        postService.createPost(stefan.getId(),
                "Hack The Box Write-up: OpenAdmin",
                "Step-by-step walkthrough of the OpenAdmin machine. Covers privilege escalation via sudo misconfiguration.",
                null, Post.PostType.DOCUMENT);

        postService.createPost(milena.getId(),
                "Statistics Assignment — Regression Analysis",
                "Multiple linear regression on student performance dataset. R2 = 0.87 after feature engineering.",
                "https://picsum.photos/seed/stats1/600/400", Post.PostType.DOCUMENT);

        postService.createPost(aleksandar.getId(),
                "Campus Coffee Shop Ranking",
                "Visited all 4 campus coffee spots. Ranking: 1. Third-floor vending (surprisingly), 2. Faculty cafe, 3. Main hall.",
                null, Post.PostType.TEXT);

        postService.createPost(filip.getId(),
                "First Week as a Freshman",
                "Survived orientation week! The campus is way bigger than I expected. Still getting lost but loving it.",
                "https://picsum.photos/seed/freshman1/600/400", Post.PostType.IMAGE);

        postService.createPost(bojan.getId(),
                "Just joined CampusXP!",
                "Excited to be part of the platform. Looking forward to connecting with fellow students and earning XP!",
                null, Post.PostType.TEXT);

        // ─── Friendships ──────────────────────────────────────────────────────
        accept(friendshipService.sendRequest(jovana.getId(),   marija.getId()));
        accept(friendshipService.sendRequest(jovana.getId(),   kristina.getId()));
        accept(friendshipService.sendRequest(jovana.getId(),   ana.getId()));
        accept(friendshipService.sendRequest(jovana.getId(),   elena.getId()));
        accept(friendshipService.sendRequest(jovana.getId(),   nikola.getId()));

        accept(friendshipService.sendRequest(marija.getId(),   kristina.getId()));
        accept(friendshipService.sendRequest(marija.getId(),   ana.getId()));
        accept(friendshipService.sendRequest(marija.getId(),   nikola.getId()));
        accept(friendshipService.sendRequest(marija.getId(),   stefan.getId()));
        accept(friendshipService.sendRequest(marija.getId(),   milena.getId()));

        accept(friendshipService.sendRequest(kristina.getId(), ana.getId()));
        accept(friendshipService.sendRequest(kristina.getId(), elena.getId()));
        accept(friendshipService.sendRequest(kristina.getId(), milena.getId()));

        accept(friendshipService.sendRequest(nikola.getId(),   stefan.getId()));
        accept(friendshipService.sendRequest(nikola.getId(),   aleksandar.getId()));

        accept(friendshipService.sendRequest(elena.getId(),    milena.getId()));
        accept(friendshipService.sendRequest(stefan.getId(),   aleksandar.getId()));
        accept(friendshipService.sendRequest(filip.getId(),    bojan.getId()));

        // Pending requests
        friendshipService.sendRequest(aleksandar.getId(), jovana.getId());
        friendshipService.sendRequest(bojan.getId(),      marija.getId());
        friendshipService.sendRequest(filip.getId(),      kristina.getId());
        friendshipService.sendRequest(milena.getId(),     nikola.getId());

        // ─── Purchases ───────────────────────────────────────────────────────
        shopService.purchaseItem(stefan.getId(),   3L);  // Cafeteria Voucher
        shopService.purchaseItem(marija.getId(),   1L);  // Campus Hoodie
        shopService.purchaseItem(kristina.getId(), 2L);  // Library Pass
        shopService.purchaseItem(jovana.getId(),   5L);  // Course Notes
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private User createUser(String username, String email, String fullName,
                            String encodedPassword, User.Role role, int xp, String avatarUrl) {
        User user = userService.createUserWithPassword(
                username, email, fullName, encodedPassword, role, User.AccountType.USER);
        if (xp > 0) userService.addPoints(user.getId(), xp, "Welcome bonus XP");
        if (avatarUrl != null) userService.updateUser(user.getId(), null, null, null, avatarUrl, null);
        return userService.findById(user.getId());
    }

    private void accept(mk.ukim.finki.campusxp.model.Friendship f) {
        friendshipService.acceptRequest(f.getId());
    }
}
