package com.mentormatrix.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mentormatrix.filter.JwtAuthenticationFilter;
import com.mentormatrix.response.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://localhost:8080,http://localhost:8081,http://localhost:8082,http://localhost:8085}")
    private String[] allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, ObjectMapper objectMapper) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public Health & Documentation
                .requestMatchers("/health", "/health/**", "/api/v1/health", "/api/health/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/api/v3/api-docs/**", "/api/swagger-ui/**", "/api/swagger-ui.html").permitAll()

                // Authenticated Auth endpoints (must be authenticated to change password)
                .requestMatchers("/auth/admin/change-password", "/api/auth/admin/change-password", "/api/v1/auth/admin/change-password").hasRole("ADMIN")
                .requestMatchers("/auth/student/change-password", "/api/auth/student/change-password", "/api/v1/auth/student/change-password").hasRole("STUDENT")

                // Public Authentication endpoints
                .requestMatchers("/auth/**", "/api/auth/**", "/api/v1/auth/**").permitAll()

                // Role-specific protected endpoints
                .requestMatchers("/admin/**", "/api/admin/**", "/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/faculty/**", "/api/faculty/**", "/api/v1/faculty/**").hasAnyRole("FACULTY", "ADMIN")
                .requestMatchers("/student/**", "/api/student/**", "/api/v1/student/**").hasAnyRole("STUDENT", "ADMIN")

                // Protected Workspace Features
                .requestMatchers("/attendance/**", "/api/attendance/**", "/api/v1/attendance/**").authenticated()
                .requestMatchers("/leaves/**", "/api/leaves/**", "/api/v1/leaves/**").authenticated()
                .requestMatchers("/batches/**", "/api/batches/**", "/api/v1/batches/**").authenticated()
                .requestMatchers("/departments/**", "/api/departments/**", "/api/v1/departments/**").authenticated()
                .requestMatchers("/common/**", "/api/common/**", "/api/v1/common/**").authenticated()

                // Default lock-down for any remaining path
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    objectMapper.writeValue(response.getWriter(), ApiResponse.error("Unauthorized"));
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    objectMapper.writeValue(response.getWriter(), ApiResponse.error("Forbidden"));
                })
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
