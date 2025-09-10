package com.zlang.zlang_api.repository;

import com.zlang.zlang_api.model.Slang;
import com.zlang.zlang_api.model.Slang;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

/**
 * Repository interface for Slang documents.
 * By extending MongoRepository, we get a full set of standard database operations
 * (save, findById, findAll, delete, etc.) for the Slang class without any implementation.
 * The types <Slang, String> specify that this repository works with Slang objects
 * and their primary key is of type String.
 */
public interface SlangRepository extends MongoRepository<Slang, String> {

    /**
     * Finds slang entries where the 'term' field matches the given regular expression.
     * This allows for case-insensitive searching.
     * The @Query annotation lets us define a custom MongoDB query.
     * '{'term': {$regex: ?0, $options: 'i'}}' translates to:
     * - 'term': The field to search in.
     * - '$regex: ?0': Use the first method parameter (?0) as the regular expression.
     * - '$options: 'i'': Make the search case-insensitive.
     *
     * @param searchTerm The regular expression pattern to search for.
     * @return A list of Slang objects that match the search criteria.
     */
    @Query("{'term': {$regex: ?0, $options: 'i'}}")
    List<Slang> findByTermRegex(String searchTerm);
    // In SlangRepository.java
    List<Slang> findByTermContainingIgnoreCase(String term);
}
