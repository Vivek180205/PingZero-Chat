package com.vivek.pingzero.repository;

import com.vivek.pingzero.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findTop50ByOrderByCreatedAtDesc();
}
