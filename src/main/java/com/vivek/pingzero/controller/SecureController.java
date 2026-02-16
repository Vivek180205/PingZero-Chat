package com.vivek.pingzero.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/secure")
public class SecureController {

    @GetMapping("/hello")
    public String hello() {
        return "You are authenticated!";
    }
}
