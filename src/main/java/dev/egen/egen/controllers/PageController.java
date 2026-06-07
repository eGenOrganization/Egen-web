package dev.egen.egen.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import dev.egen.egen.controllers.article.ArticleController;
import java.util.Locale;

@Controller
public class PageController {
    @Autowired private MessageSource messageSource;
    @Autowired private ArticleController articleController;

    private void setContnentToElement(Model model, Locale locale, String elementName){
        model.addAttribute(elementName, messageSource.getMessage(elementName, null, locale));
    }

    @ModelAttribute
    public void addAttributes(Model model, Locale locale) {
        setContnentToElement(model, locale, "main");
        setContnentToElement(model, locale, "creator");
    }

    @GetMapping("/")
    public String homePage(Model model, Locale locale) {
        return "index";
    }

    @GetMapping("/creator")
    public String creatorPage(Model model, Locale locale) {
        return "creator";
    }

    @GetMapping("/article")
    public String articlePage(Model model, String title, Locale locale) {
        return articleController.getArticlePageByTitle(title, model);
    }
}
