package com.vivek.pingzero.config;

import com.vivek.pingzero.security.JwtUtil;
import com.vivek.pingzero.websocket.JwtChannelInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


    JwtChannelInterceptor jwtChannelInterceptor;
    WebSocketConfig(JwtChannelInterceptor jwtChannelInterceptor){
        this.jwtChannelInterceptor = jwtChannelInterceptor;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(org.springframework.messaging.simp.config.ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);
    }
}
