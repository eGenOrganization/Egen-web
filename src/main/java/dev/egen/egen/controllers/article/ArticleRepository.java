package dev.egen.egen.controllers.article;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends MongoRepository<Article, String> {
    Optional<Article> findById(String id);
    Optional<Article> findByTitle(String title);
}
