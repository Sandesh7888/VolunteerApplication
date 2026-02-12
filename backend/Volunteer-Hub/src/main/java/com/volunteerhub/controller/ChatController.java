package com.volunteerhub.controller;

import com.volunteerhub.dto.ChatRequest;
import com.volunteerhub.dto.ChatResponse;
import com.volunteerhub.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request,
            Principal principal) {

        String username = "Guest";
        String role = "User";

        if (principal instanceof Authentication auth) {
            username = auth.getName();
            role = auth.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(", "));
        }

        String reply = chatService.chat(request.getMessage(), username, role);

        return ResponseEntity.ok(new ChatResponse(reply));
    }
}