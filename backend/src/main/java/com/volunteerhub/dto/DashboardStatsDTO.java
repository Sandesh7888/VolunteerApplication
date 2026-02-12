package com.volunteerhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private long totalEvents;
    private long totalOrganizers;
    private long totalVolunteers;
    private long pendingApprovals;
}
