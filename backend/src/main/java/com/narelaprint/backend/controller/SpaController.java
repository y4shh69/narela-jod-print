package com.narelaprint.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = {
            "/{path:^(?!api|uploads|assets)[^\\.]*}",
            "/{path:^(?!api|uploads|assets)[^\\.]*}/**/{path2:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
