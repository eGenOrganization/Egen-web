package dev.egen.egen.controllers.article;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.time.format.DateTimeFormatter;

@Controller
public class ArticleController {

    @Autowired
    private ArticleRepository articleRepository;

    @GetMapping("/article/{id}")
    public String getArticlePageById(@PathVariable String id, Model model) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article is not found: " + id));
        return getView(article, model);
    }

    @GetMapping("/article/{title}")
    public String getArticlePageByTitle(@PathVariable String title, Model model) {
        Article article = articleRepository.findByTitle(title)
                .orElseThrow(() -> new IllegalArgumentException("Article is not found: " + title));
        return getView(article, model);
    }

    private String getView(Article article, Model model){
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy, HH:mm");
        String formattedDate = article.getCreatedAt().format(formatter);
        
        model.addAttribute("article", article);
        model.addAttribute("formattedDate", formattedDate);
        return "article-view";
    }
}

