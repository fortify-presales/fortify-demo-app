# Fortify Agentic Analyzer Use Case: Broken Object-Level Authorization

## Slide Title

**Agentic Analyzer finds authorization gaps that local dataflow analysis can miss**

## Slide Body

### The Risk

An authenticated user can request another user's payment records by changing the `userId` path parameter. The endpoint verifies that the caller has a valid JWT, but it never verifies that the requested payment records belong to that caller.

### Why This Is an Agentic Analyzer Use Case

Traditional SAST is strongest when it can follow a local source-to-sink path, such as user input reaching SQL, a shell, or a file API. This issue requires connecting several parts of the application:

1. `SecurityConfig` requires only `.authenticated()` for `/api/**`.
2. The endpoint accepts a caller-controlled `userId`.
3. The repository fetches records for that supplied identifier.
4. No ownership or role check compares the authenticated identity with `userId`.

Fortify Agentic Analyzer reasons across these application components and identifies the broken authorization assumption: authenticated users must not automatically be authorized to access every object.

## Vulnerable Code

```java
// SecurityConfig.java
.requestMatchers("/api/**").authenticated()

// PaymentController.java
@GetMapping("/user/{userId}")
public List<Payment> getByUser(@PathVariable Long userId) {
    // INSECURE (intentional): accepts any userId without verifying ownership.
    // Secure alternative: compare the requested userId to the authenticated user.
    return paymentRepository.findByUserId(userId);
}
```

## Speaker Notes

- An attacker first obtains any valid account, including through self-registration.
- They then change `/api/payments/user/1` to `/api/payments/user/2`.
- The API returns the second user's payment data because it checks authentication, not authorization for the requested object.
- The same ownership-check gap appears in payment deletion, charging, transaction history, and user-profile updates.

## Secure Pattern (Optional Follow-On Slide)

```java
@GetMapping("/user/{userId}")
public ResponseEntity<List<Payment>> getByUser(
        @PathVariable Long userId,
        Authentication authentication) {
    Long authenticatedUserId = userService.findIdByUsername(authentication.getName());
    if (!authenticatedUserId.equals(userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    return ResponseEntity.ok(paymentRepository.findByUserId(userId));
}
```

## One-Sentence Takeaway

**Fortify Agentic Analyzer found that valid authentication was incorrectly treated as permission to access another user's records.**