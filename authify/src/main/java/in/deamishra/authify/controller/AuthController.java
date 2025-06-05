package in.deamishra.authify.controller;

import in.deamishra.authify.io.AuthRequest;
import in.deamishra.authify.io.AuthResponse;
import in.deamishra.authify.io.ResetPasswordRequest;
import in.deamishra.authify.service.AppUserDetailsService;
import in.deamishra.authify.service.ProfileService;
import in.deamishra.authify.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(
        origins = "https://authify-secure-authentication-app.vercel.app",
        allowCredentials = "true",
        maxAge = 3600
)
@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserDetailsService appUserDetailsService;
    private final JwtUtil jwtUtil;
    private final ProfileService profileService;

    /* ------------------------------------------------ LOGIN ------------------------------------------------ */

@PostMapping("/api/v1.0/login")
public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletResponse response) {
    try {
        authenticate(request.getEmail(), request.getPassword());

        final UserDetails userDetails = appUserDetailsService.loadUserByUsername(request.getEmail());
        final String jwtToken = jwtUtil.generateToken(userDetails);

        ResponseCookie cookie = ResponseCookie.from("jwt", jwtToken)
            .httpOnly(true)
            .secure(true)
            .sameSite("None")
            .path("/")
            .maxAge(Duration.ofDays(1))
            .build();

        // ✅ This is the real fix: set it directly on servlet response
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        System.out.println("✅ JWT Token: " + jwtToken);
        System.out.println("✅ Set-Cookie: " + cookie.toString());
        return ResponseEntity.ok(new AuthResponse(request.getEmail(), jwtToken));

        } catch (BadCredentialsException ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Email or password is incorrect");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);

        } catch (DisabledException ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Account is disabled");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);

        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Authentication failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    private void authenticate(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
    }

    /* ---------------------------------------------- MISC UTILS --------------------------------------------- */

    @GetMapping("/api/v1.0/is-authenticated")
    public ResponseEntity<Boolean> isAuthenticated(
            @CurrentSecurityContext(expression = "authentication?.name") String email) {
        return ResponseEntity.ok(email != null);
    }

    /* -------------------------------------------- PASSWORD RESET ------------------------------------------- */

    @PostMapping("/api/v1.0/send-reset-otp")
    public void sendResetOtp(@RequestParam String email) {
        try {
            profileService.sendResetOtp(email);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @PostMapping("/api/v1.0/reset-password")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            profileService.resetPassword(
                    request.getEmail(), request.getOtp(), request.getNewPassword());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /* -------------------------------------------- EMAIL VERIFICATION --------------------------------------- */

    @PostMapping("/api/v1.0/send-otp")
    public void sendVerifyOtp(
            @CurrentSecurityContext(expression = "authentication?.name") String email) {
        try {
            profileService.sendOtp(email);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @PostMapping("/api/v1.0/verify-otp")
    public void verifyEmail(
            @RequestBody Map<String, Object> request,
            @CurrentSecurityContext(expression = "authentication?.name") String email) {

        if (request.get("otp") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing details");
        }

        try {
            profileService.verifyOtp(email, request.get("otp").toString());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /* ------------------------------------------------ LOGOUT ------------------------------------------------ */

    @PostMapping("/api/v1.0/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logged out successfully!");
    }
}
