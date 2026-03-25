package com.opentext.appsec.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.opentext.appsec.demo.model.User;

/**
 * Repository for User entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}
