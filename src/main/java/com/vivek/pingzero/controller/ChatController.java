package com.vivek.pingzero.controller;

import com.vivek.pingzero.dto.TypingEvent;
import com.vivek.pingzero.model.ChatMessage;
import com.vivek.pingzero.repository.ChatMessageRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
public class ChatController {

//STOMP
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;

    public ChatController(ChatMessageRepository chatMessageRepository, SimpMessagingTemplate messagingTemplate) {
        this.chatMessageRepository = chatMessageRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/sendMessage")
    public void sendMessage(ChatMessage message, Principal principal) {

        String username = principal.getName();

        message.setSender(username);
        message.setCreatedAt(LocalDateTime.now());

        chatMessageRepository.save(message);
        messagingTemplate.convertAndSend("/topic/messages", message);
    }

    @MessageMapping("/history")
    @SendToUser("/queue/history")
    public List<ChatMessage> getHistory() {

        List<ChatMessage> messages = chatMessageRepository.findTop50ByOrderByCreatedAtDesc();

        Collections.reverse(messages); // oldest first

        return messages;
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload Map<String, String> payload, Principal principal) {

        String status = payload.get("status"); // START or STOP
        String username = principal.getName();

        messagingTemplate.convertAndSend(
                "/topic/typing",
                Optional.of(Map.of(
                        "user", username,
                        "status", status
                ))
        );
    }


}
