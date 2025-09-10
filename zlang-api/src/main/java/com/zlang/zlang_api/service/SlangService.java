package com.zlang.zlang_api.service;

import com.zlang.zlang_api.dto.SlangRequest;
import com.zlang.zlang_api.model.Slang;
import com.zlang.zlang_api.model.User;
import com.zlang.zlang_api.repository.SlangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SlangService {

    private final SlangRepository slangRepository;

    public List<Slang> search(String query) {
        // Find any slang term containing the query, ignoring case
        return slangRepository.findByTermContainingIgnoreCase(query);
    }

    public Slang create(SlangRequest request, User currentUser) {
        Slang newSlang = new Slang();
        newSlang.setTerm(request.getTerm());
        newSlang.setMeaning(request.getMeaning());
        newSlang.setExample(request.getExample());
        // Crucially, we set the author's ID from the currently logged-in user
        newSlang.setAuthorId(currentUser.getId());
        return slangRepository.save(newSlang);
    }

    public Slang update(String id, SlangRequest request, User currentUser) {
        // Find the existing slang by its ID, or throw an error if it doesn't exist.
        Slang existingSlang = slangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slang not found with id: " + id));

        // SECURITY CHECK: This is the most important part.
        // We verify that the ID of the user trying to update the slang
        // matches the ID of the user who originally created it.
        if (!existingSlang.getAuthorId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to edit this slang.");
        }

        // If the check passes, update the fields and save the changes.
        existingSlang.setTerm(request.getTerm());
        existingSlang.setMeaning(request.getMeaning());
        existingSlang.setExample(request.getExample());
        return slangRepository.save(existingSlang);
    }

    public void delete(String id, User currentUser) {
        // Find the existing slang by its ID.
        Slang existingSlang = slangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slang not found with id: " + id));

        // SECURITY CHECK: Perform the same check as the update method.
        // A user can only delete their own slang entries.
        if (!existingSlang.getAuthorId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to delete this slang.");
        }

        // If the check passes, delete the slang from the database.
        slangRepository.delete(existingSlang);
    }
}

