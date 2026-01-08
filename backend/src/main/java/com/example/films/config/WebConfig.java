package com.example.films.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
  
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
   
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String currentDir = System.getProperty("user.dir");
        System.out.println("Répertoire courant: " + currentDir);
        
        registry.addResourceHandler("/images/raccords/**")
                .addResourceLocations("file:assets/raccords/");
    }
}

