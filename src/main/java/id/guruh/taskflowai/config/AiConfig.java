package id.guruh.taskflowai.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("""
                        Kamu adalah asisten yang membantu pengguna aplikasi.
                        Jawab dengan singkat, jelas, dan dalam Bahasa Indonesia
                        kecuali diminta menggunakan bahasa lain.
                        """)
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .build();
    }
}
