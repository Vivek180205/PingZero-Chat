package com.vivek.pingzero.model;

import lombok.Data;

@Data
public class ChatMessage {

    private String sender;
    private String content;
    private String type;
}
