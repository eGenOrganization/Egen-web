package dev.egen.egen.Controllers.CScripts;

import java.util.Arrays;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/c-scripts") 
public class CRestController {

    @GetMapping("/add")
    public int add(String args) {
        int[] arr = Arrays.stream(args.split("," , 2)).mapToInt(Integer::parseInt).toArray();
        int result = CLibsController.INSTANCE.add(arr[0], arr[1]);
        return result;
    }
}