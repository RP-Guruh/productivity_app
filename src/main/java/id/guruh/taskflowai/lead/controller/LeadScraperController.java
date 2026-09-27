package id.guruh.taskflowai.lead.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/leads")
public class LeadScraperController {

    private static final Logger log = LoggerFactory.getLogger(LeadScraperController.class);

    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> searchLeads(
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            @RequestParam(name = "location", defaultValue = "") String location,
            @RequestParam(name = "limit", defaultValue = "20") int limit
    ) {
        if (keyword.isBlank() && location.isBlank()) {
            return ResponseEntity.badRequest().body("[]");
        }

        try {
            File scriptFile = new File("/home/guruh/development/productivity_app/google-maps-scraper/live-scraper.js");
            if (!scriptFile.exists()) {
                File projectDir = new File(System.getProperty("user.dir"));
                scriptFile = new File(projectDir, "google-maps-scraper/live-scraper.js");
            }

            log.info("Starting live scraper for query: '{}' in '{}' (limit: {})", keyword, location, limit);

            ProcessBuilder pb = new ProcessBuilder(
                    "node",
                    scriptFile.getAbsolutePath(),
                    keyword,
                    location,
                    String.valueOf(Math.min(limit, 50))
            );
            pb.directory(scriptFile.getParentFile());
            pb.redirectErrorStream(false);

            Process process = pb.start();
            StringBuilder stdout = new StringBuilder();
            StringBuilder stderr = new StringBuilder();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    stdout.append(line);
                }
            }

            try (BufferedReader errReader = new BufferedReader(new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = errReader.readLine()) != null) {
                    stderr.append(line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode == 0 && stdout.length() > 0) {
                log.info("Live scraper finished successfully for '{}' in '{}'", keyword, location);
                return ResponseEntity.ok(stdout.toString());
            } else {
                log.warn("Live scraper failed with code {}: {}", exitCode, stderr);
                return ResponseEntity.ok("[]");
            }
        } catch (Exception e) {
            log.error("Exception during live scraping: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
