package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        log.info("Login attempt for user: {}", request.getUsername());
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        log.info("Registration attempt for user: {}", request.getUsername());
        AuthResponse response = userService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // In JWT-based auth, logout is client-side (just remove token)
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Map<String, Object> response = new HashMap<>();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }

        String token = authHeader.substring(7);

        if (!jwtTokenProvider.validateToken(token)) {
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }

        String username = jwtTokenProvider.getUsernameFromToken(token);
        String role = jwtTokenProvider.getRoleFromToken(token).name();
        Long userId = jwtTokenProvider.getUserIdFromToken(token);

        response.put("authenticated", true);
        response.put("username", username);
        response.put("role", role);
        response.put("userId", userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // Validate token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }

        User.Role role = jwtTokenProvider.getRoleFromToken(token);
        if (role != User.Role.ADMIN) {
            return ResponseEntity.status(403).build(); // Only admins can list users
        }

        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> roleUpdate,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // Validate token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }

        User.Role currentRole = jwtTokenProvider.getRoleFromToken(token);
        if (currentRole != User.Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        String newRole = roleUpdate.get("role");
        if (newRole == null) {
            return ResponseEntity.badRequest().build();
        }

        User updatedUser = userService.updateUserRole(userId, User.Role.valueOf(newRole.toUpperCase()));
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{userId}/deactivate")
    public ResponseEntity<User> deactivateUser(
            @PathVariable Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }

        User.Role role = jwtTokenProvider.getRoleFromToken(token);
        if (role != User.Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        User updatedUser = userService.deactivateUser(userId);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{userId}/activate")
    public ResponseEntity<User> activateUser(
            @PathVariable Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }

        User.Role role = jwtTokenProvider.getRoleFromToken(token);
        if (role != User.Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        User updatedUser = userService.activateUser(userId);
        return ResponseEntity.ok(updatedUser);
    }
}
