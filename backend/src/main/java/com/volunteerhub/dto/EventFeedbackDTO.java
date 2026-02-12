package com.volunteerhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventFeedbackDTO {
    private String feedback;
    private Integer rating;
}
