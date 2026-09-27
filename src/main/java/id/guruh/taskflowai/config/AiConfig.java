package id.guruh.taskflowai.config;

import okhttp3.Request;
import okhttp3.RequestBody;
import okio.Buffer;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.openai.http.okhttp.OpenAiHttpClientBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public OpenAiHttpClientBuilderCustomizer openAiStreamFalseCustomizer() {
        return builder -> builder.interceptor(chain -> {
            Request original = chain.request();
            RequestBody body = original.body();
            if (body != null && original.url().encodedPath().contains("/chat/completions")) {
                Buffer buffer = new Buffer();
                body.writeTo(buffer);
                String bodyString = buffer.readUtf8();
                if (!bodyString.contains("\"stream\"")) {
                    String modified = bodyString.replaceFirst("\\{", "{\"stream\":false,");
                    RequestBody newBody = RequestBody.create(modified, body.contentType());
                    Request newRequest = original.newBuilder()
                            .method(original.method(), newBody)
                            .build();
                    return chain.proceed(newRequest);
                }
            }
            return chain.proceed(original);
        });
    }

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

