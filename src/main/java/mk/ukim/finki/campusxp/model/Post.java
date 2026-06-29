package mk.ukim.finki.campusxp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = true)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostType postType;

    @Column(nullable = false)
    private int pointsAwarded;

    @Column(nullable = false)
    private boolean archived = false;

    @Column(nullable = false)
    private LocalDateTime  createdAt =  LocalDateTime.now();



    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    public enum PostType {
        TEXT,
        IMAGE,
        DOCUMENT,
        VIDEO
    }
}
