package mk.ukim.finki.campusxp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String fullName;

    private String avatarUrl;

    @Column(nullable = false)
    private int currentPoints;

    @Column(nullable = false)
    private int totalEarnedPoints;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role = Role.STUDENT;

    public enum Role {
        STUDENT,
        PROFESSOR,
        ADMIN
    }

}
