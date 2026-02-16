package com.vivek.pingzero.controller;

import com.vivek.pingzero.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatController {

//STOMP
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/sendMessage")
    public void sendMessage(ChatMessage message, Principal principal) {

        String username = principal.getName();  // IMPORTANT

        message.setSender(username);

        messagingTemplate.convertAndSend("/topic/messages", message);
    }

}
