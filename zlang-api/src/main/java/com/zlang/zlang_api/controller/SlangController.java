package com.zlang.zlang_api.controller;

import com.zlang.zlang_api.dto.SlangRequest;
import com.zlang.zlang_api.model.Slang;
import com.zlang.zlang_api.model.User;
import com.zlang.zlang_api.service.SlangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slangs")
@RequiredArgsConstructor
public class SlangController {

    private final SlangService slangService;

    // PUBLIC Endpoint to search for slang
    @GetMapping("/search")
    public ResponseEntity<List<Slang>> searchSlangs(@RequestParam(defaultValue = "") String query) {
        return ResponseEntity.ok(slangService.search(query));
    }

    // PROTECTED Endpoint to create a new slang
    @PostMapping
    public ResponseEntity<Slang> createSlang(@RequestBody SlangRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(slangService.create(request, currentUser));
    }

    // PROTECTED Endpoint to update an existing slang
    @PutMapping("/{id}")
    public ResponseEntity<Slang> updateSlang(
            @PathVariable String id,
            @RequestBody SlangRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(slangService.update(id, request, currentUser));
    }

    // PROTECTED Endpoint to delete a slang
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSlang(@PathVariable String id, @AuthenticationPrincipal User currentUser) {
        slangService.delete(id, currentUser);
        return ResponseEntity.noContent().build(); // Standard response for a successful delete
    }
}

