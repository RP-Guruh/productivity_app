package id.guruh.taskflowai.common.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Forward semua route non-API ke index.html agar Vue Router
 * bisa menangani client-side routing pada saat hard refresh (Ctrl+F5).
 */
@Controller
public class SpaForwardController {

    @RequestMapping(value = {
            "/{path:[^\\.]*}",
            "/{path:[^\\.]*}/{subpath:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
