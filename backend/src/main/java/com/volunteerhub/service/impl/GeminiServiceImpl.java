package com.volunteerhub.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.volunteerhub.model.User;
import com.volunteerhub.repository.EventRepository;
import com.volunteerhub.repository.EventVolunteerRepository;
import com.volunteerhub.repository.UserRepository;
import com.volunteerhub.service.ChatService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;

@Service
@Primary
public class GeminiServiceImpl implements ChatService {

    @Value("${spring.ai.gemini.api-key}")
    private String apiKey;

    @Value("${spring.ai.gemini.base-url}")
    private String baseUrl;

    @Value("${spring.ai.gemini.model}")
    private String model;

    private final ObjectMapper mapper;
    private final HttpClient client;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventVolunteerRepository eventVolunteerRepository;

    public GeminiServiceImpl(ObjectMapper mapper, UserRepository userRepository, EventRepository eventRepository,
            EventVolunteerRepository eventVolunteerRepository) {
        this.mapper = mapper;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.eventVolunteerRepository = eventVolunteerRepository;
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public String chat(String userMessage, String username, String role) {

        try {
            // Fetch real-time stats
            long totalEvents = eventRepository.count();
            long totalUsers = userRepository.count();
            long totalVolunteers = userRepository.countByRole(User.Role.VOLUNTEER);
            long totalOrganizers = userRepository.countByRole(User.Role.ORGANIZER);

            // Fetch user specific context
            Optional<User> userOpt = userRepository.findByEmail(username);
            String userContext = "";
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                int userEventsCount = 0;
                if (user.getRole() == User.Role.VOLUNTEER) {
                    userEventsCount = eventVolunteerRepository.findByVolunteer(user).size();
                } else if (user.getRole() == User.Role.ORGANIZER) {
                    userEventsCount = eventRepository.findByOrganizer(user).size();
                }
                userContext = """
                        - Name: %s
                        - Points: %d
                        - Verified: %s
                        - Events associated with: %d
                        """.formatted(user.getName(), user.getPoints(), user.getVerified() ? "Yes" : "No",
                        userEventsCount);
            }

            String systemPrompt = """
                    You are a helpful assistant for a Volunteer Management System.
                    Answer clearly and briefly.

                    CURRENT SYSTEM STATISTICS:
                    - Total Users: %d
                    - Total Volunteers: %d
                    - Total Organizers: %d
                    - Total Events: %d

                    CURRENT USER CONTEXT:
                    %s
                    - Username: %s
                    - Role: %s

                    When asked about statistics (like how many events there are), use the numbers provided above.
                    """.formatted(totalUsers, totalVolunteers, totalOrganizers, totalEvents, userContext, username,
                    role);

            // ---------- JSON BODY ----------
            ObjectNode root = mapper.createObjectNode();

            // System instruction
            ObjectNode systemInstruction = mapper.createObjectNode();
            ArrayNode systemParts = mapper.createArrayNode();
            systemParts.add(mapper.createObjectNode().put("text", systemPrompt));
            systemInstruction.set("parts", systemParts);
            root.set("systemInstruction", systemInstruction);

            // User message
            ArrayNode contents = mapper.createArrayNode();
            ObjectNode content = mapper.createObjectNode();
            content.put("role", "user");

            ArrayNode parts = mapper.createArrayNode();
            parts.add(mapper.createObjectNode().put("text", userMessage));

            content.set("parts", parts);
            contents.add(content);
            root.set("contents", contents);

            String body = mapper.writeValueAsString(root);

            String url = "%s/%s:generateContent?key=%s"
                    .formatted(baseUrl, model, apiKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return "AI error: " + response.body();
            }

            JsonNode json = mapper.readTree(response.body());

            JsonNode candidates = json.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode responseParts = candidates.get(0).path("content").path("parts");
                if (responseParts.isArray() && responseParts.size() > 0) {
                    return responseParts.get(0).path("text").asText();
                }
            }

            return "No response text found.";

        } catch (Exception e) {
            return "Gemini Service Error: " + e.getMessage();
        }
    }
}