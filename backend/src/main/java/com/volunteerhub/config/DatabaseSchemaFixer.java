package com.volunteerhub.config;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSchemaFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private static final Logger logger = LoggerFactory.getLogger(DatabaseSchemaFixer.class);

    @Override
    public void run(String... args) throws Exception {
        logger.info("🔧 Running Database Schema Fixes...");

        try {
            // Drop the existing check constraint
            logger.info("Dropping old constraint...");
            jdbcTemplate
                    .execute("ALTER TABLE event_volunteers DROP CONSTRAINT IF EXISTS event_volunteers_status_check");

            // Add the new check constraint including 'ATTENDED'
            logger.info("Adding new constraint with ATTENDED status...");
            jdbcTemplate.execute("ALTER TABLE event_volunteers ADD CONSTRAINT event_volunteers_status_check " +
                    "CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'REMOVED', 'ATTENDED'))");
            logger.info("✅ Database Schema Fixed Successfully!");
        } catch (Exception e) {
            logger.error("❌ Failed to fix database schema: " + e.getMessage());
        }
    }
}
