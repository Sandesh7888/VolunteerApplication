package com.volunteerhub.config;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Temporary component to fix database constraints that Hibernate
 * ddl-auto=update misses.
 * Specifically updates the check constraint on support_tickets table to allow
 * new statuses.
 */
@Component
@RequiredArgsConstructor
public class DatabaseConstraintFixer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConstraintFixer.class);
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        logger.info("Initializing DatabaseConstraintFixer...");
        try {
            // Drop existing status check constraint if it exists.
            // Constraint name from error: support_tickets_status_check
            jdbcTemplate.execute(
                    "ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_status_check");

            // Re-create constraint with all required status values
            jdbcTemplate.execute("ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_status_check " +
                    "CHECK (status IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'FIXED'))");

            logger.info("Successfully updated 'support_tickets_status_check' constraint.");
        } catch (Exception e) {
            logger.error("Failed to update database constraint: {}", e.getMessage());
        }
    }
}
