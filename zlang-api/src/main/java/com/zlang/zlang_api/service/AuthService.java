package com.zlang.zlang_api.service;

import com.zlang.zlang_api.dto.AuthRequest;
import com.zlang.zlang_api.dto.AuthResponse;
import com.zlang.zlang_api.dto.RegisterRequest;
import com.zlang.zlang_api.model.User;
import com.zlang.zlang_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        var user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder().token(jwtToken).build();
    }

    /**
     * THIS IS THE MODIFIED METHOD.
     * It wraps the authentication logic in a try-catch block.
     * This allows us to see the specific error in the console instead of just a generic 403.
     */
    public AuthResponse login(AuthRequest request) {
        try {
            // This is the line that performs the password check.
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            // If the password or username is wrong, it will fail here.
            System.out.println("!!! AUTHENTICATION FAILED !!!");
            System.out.println("Error Type: " + e.getClass().getSimpleName());
            System.out.println("Error Message: " + e.getMessage());
            // We re-throw the exception to ensure the 403 is still sent.
            throw e;
        }

        // This code only runs if authentication was successful.
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(); // Should not fail if auth succeeded
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder().token(jwtToken).build();
    }
}

