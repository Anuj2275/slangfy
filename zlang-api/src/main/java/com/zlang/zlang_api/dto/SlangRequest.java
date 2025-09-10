package com.zlang.zlang_api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for carrying slang data for create and update operations.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SlangRequest {
    private String term;
    private String meaning;
    private String example;
}
