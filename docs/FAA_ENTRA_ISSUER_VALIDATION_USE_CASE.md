# Fortify Agentic Analyzer Use Case: Entra Token Validation Downgrade

## Slide Title

**Agentic Analyzer finds an authentication bypass hidden in an exception fallback**

## Slide Body

### The Risk

The Entra token exchange starts with strict JWT validation. If validation fails because the issuer does not match, the application catches that error and retries with a decoder that validates the signature but does not enforce the expected issuer or audience. A token from an unintended identity provider or tenant can therefore pass the fallback path and be exchanged for an application JWT.

### Why This Is an Agentic Analyzer Use Case

The security flaw is not a single dangerous API call. It emerges only when the analyzer connects the validation and business-flow steps:

1. The primary `jwtDecoder` rejects a token for issuer mismatch.
2. Exception text is used to identify that specific security failure.
3. `relaxedJwtDecoder` retries decoding without issuer or audience validation.
4. The extracted principal is mapped to a local user.
5. The exchange endpoint mints an application JWT for that local user.

Traditional SAST can identify JWT libraries and individual calls, but this issue depends on understanding that an exception path deliberately weakens a failed authentication control before granting an authenticated application session.

## Vulnerable Code

```java
// EntraTokenService.java
try {
    jwt = jwtDecoder.decode(cleanToken); // Strict issuer validation
} catch (JwtException primaryException) {
    boolean issuerMismatch = primaryException.getMessage() != null
            && primaryException.getMessage().toLowerCase()
                    .contains("iss claim is not valid");
    if (issuerMismatch && relaxedJwtDecoder != null) {
        // INSECURE (intentional): bypasses strict issuer validation.
        // Secure alternative: reject the token and retain issuer/audience checks.
        jwt = relaxedJwtDecoder.decode(cleanToken);
    } else {
        throw primaryException;
    }
}

// AuthController.java
String username = mapToLocalUsername(entraPrincipal);
return ResponseEntity.ok(jwtUtil.generateToken(username));
```

## Speaker Notes

- A signed token is not necessarily a trusted token. The issuer and audience identify who issued it and which application it is intended for.
- The primary decoder correctly rejects an issuer mismatch, but the exception handler turns that rejection into a retry using weaker validation.
- After the fallback succeeds, the application maps the token claim to a local account and issues its own JWT.
- This is a verification-path completeness failure: every path that mints an application token must enforce the same issuer and audience policy.

## Secure Pattern (Optional Follow-On Slide)

```java
public String validateEntraTokenAndGetUsername(String token) {
    String cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;
    Jwt jwt = jwtDecoder.decode(cleanToken);
    // Configure jwtDecoder with the expected issuer and audience validators.
    return jwt.getClaimAsString("preferred_username");
}
```

## One-Sentence Takeaway

**Fortify Agentic Analyzer found that a failed issuer check was converted into a weaker validation path that could mint a trusted application token.**