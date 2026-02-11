package edu.kh.goodsugar.security;

public record OAuthProfile(
	    String provider,
	    String providerId,
	    String email,
	    String nickname
	    
	) {}
