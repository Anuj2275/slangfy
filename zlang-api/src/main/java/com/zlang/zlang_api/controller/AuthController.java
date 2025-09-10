package com.zlang.zlang_api.controller;

import com.zlang.zlang_api.dto.AuthRequest;
import com.zlang.zlang_api.dto.AuthResponse;
import com.zlang.zlang_api.dto.RegisterRequest;
import com.zlang.zlang_api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * This is the corrected method call.
     * It now correctly calls authService.login() instead of authService.authenticate().
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody AuthRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }
}

