package in.deamishra.authify.controller;

import in.deamishra.authify.io.ProfileRequest;
import in.deamishra.authify.io.ProfileResponse;
import in.deamishra.authify.service.EmailService;
import in.deamishra.authify.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.*;

/**
 * Handles registration and profile-read endpoints.
 *
 * NOTE:  The React front-end is calling /profile and /register without the
 *        /api/v1.0 prefix, so this controller now exposes BOTH routes.
 */
@CrossOrigin(
        origins = "https://authify-secure-authentication-app.vercel.app",
        allowCredentials = "true",
        maxAge = 3600
)
@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final EmailService  emailService;

    /* ------------------------------------------------ REGISTER -------------------------------------------- */

    @PostMapping({"/register", "/api/v1.0/register"})
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse register(@Valid @RequestBody ProfileRequest request) {

        ProfileResponse response = profileService.createProfile(request);
        emailService.sendWelcomeEmail(response.getEmail(), response.getName());
        return response;
    }

    /* ------------------------------------------------ PROFILE --------------------------------------------- */

    @GetMapping({"/profile", "/api/v1.0/profile"})
    public ProfileResponse getProfile(
            @CurrentSecurityContext(expression = "authentication?.name") String email) {

        return profileService.getProfile(email);
    }
}
