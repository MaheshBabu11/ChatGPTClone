package com.maheshbabu11.service;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import dev.hilla.BrowserCallable;
import org.springframework.ai.client.AiClient;

@BrowserCallable
@AnonymousAllowed
public class AiService {

    private final AiClient aiClient;

    public AiService(AiClient aiClient) {

        this.aiClient = aiClient;
    }

    public String chat(String prompt) {
        return aiClient.generate(prompt);
    }
}
