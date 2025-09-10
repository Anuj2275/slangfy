package com.zlang.zlang_api.config;

import com.zlang.zlang_api.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // --- START OF DEBUGGING ---
        System.out.println("\n--- JWT AUTH FILTER ---");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Authorization Header: " + authHeader);
        // --- END OF DEBUGGING ---

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No JWT Token found in Authorization Header. Passing to next filter.");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7); // "Bearer ".length()
        username = jwtService.extractUsername(jwt);

        // --- MORE DEBUGGING ---
        System.out.println("Extracted JWT: " + jwt);
        System.out.println("Extracted Username: " + username);
        // --- END OF DEBUGGING ---

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                // --- SUCCESS DEBUGGING ---
                System.out.println("Token is VALID. Authenticating user.");
                // --- END OF DEBUGGING ---
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                // --- FAILURE DEBUGGING ---
                System.out.println("Token is INVALID.");
                // --- END OF DEBUGGING ---
            }
        }
        filterChain.doFilter(request, response);
    }
}

