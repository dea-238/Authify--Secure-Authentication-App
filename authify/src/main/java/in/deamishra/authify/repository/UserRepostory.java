package in.deamishra.authify.repository;

import in.deamishra.authify.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepostory extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    Boolean existsByEmail(String email);
}
