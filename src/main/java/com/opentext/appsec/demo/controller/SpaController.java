package com.opentext.appsec.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    /**
     * Forward any unmapped paths (except for static resources) to index.html so that client-side routing can handle them.
     */
    @RequestMapping({"/", "/index.html"})
    public String forward() {
        return "forward:/index.html";
    }
}
