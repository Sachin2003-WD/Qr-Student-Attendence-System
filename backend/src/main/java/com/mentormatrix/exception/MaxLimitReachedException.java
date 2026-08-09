package com.mentormatrix.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class MaxLimitReachedException extends RuntimeException {
    public MaxLimitReachedException(String message) {
        super(message);
    }
}
