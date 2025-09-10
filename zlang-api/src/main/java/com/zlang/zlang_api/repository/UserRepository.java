package com.zlang.zlang_api.repository;

import com.zlang.zlang_api.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

/**
 * Repository interface for User documents.
 * Extends MongoRepository to provide standard CRUD operations for the User class.
 */
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Finds a user by their username. Spring Data generates the query from the method name.
     *
     * @param username The username to search for.
     * @return An Optional containing the User if found, otherwise empty.
     */
    Optional<User> findByUsername(String username);

}
