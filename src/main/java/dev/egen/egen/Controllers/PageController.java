package dev.egen.egen.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.Locale;

@Controller

public class PageController {
    @Autowired
    private MessageSource messageSource;

    private void setContnentToElement(Model model, Locale locale, String elementName){
        model.addAttribute(elementName, messageSource.getMessage(elementName, null, locale));
    }

    @ModelAttribute
    public void addAttributes(Model model, Locale locale) {
        setContnentToElement(model, locale, "mainPage");
        setContnentToElement(model, locale, "secondPage");
    }

    @GetMapping("/")
    public String homePage(Model model, Locale locale) {
        setContnentToElement(model, locale, "welcomeMessage");
        model.addAttribute("activePage", "home");
        return "index";
    }

    @GetMapping("/second-page")
    public String secondPage(Model model) {
        return "second_page";
    }
}
