package com.zlang.zlang_api.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a slang entry in the database.
 * The @Document annotation marks this class as a MongoDB document.
 * The collection name will be 'slangs'.
 */
@Data // Generates getters, setters, toString, equals, and hashCode methods.
@NoArgsConstructor // Generates a no-argument constructor.
@AllArgsConstructor // Generates a constructor with all arguments.
@Builder // Provides the builder pattern for object creation.
@Document(collection = "slangs")
public class Slang {

    /**
     * The unique identifier for the slang entry.
     * The @Id annotation marks this field as the primary key.
     */
    @Id
    private String id;

    /**
     * The slang term itself.
     * @NotBlank ensures this field is not null and contains at least one non-whitespace character.
     */
    @NotBlank(message = "Term cannot be blank")
    private String term;

    /**
     * The definition or meaning of the slang term.
     * @NotBlank ensures this field is not null.
     */
    @NotBlank(message = "Meaning cannot be blank")
    private String meaning;

    /**
     * An example sentence showing the slang in context. This field is optional.
     */
    private String example;

    /**
     * The ID of the user who submitted this slang term.
     * This will be used to link slang entries to their authors.
     */
    private String authorId;
}
