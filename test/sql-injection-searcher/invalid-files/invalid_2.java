package com.reviewme.reviewme_backend.application.repository;

import java.math.BigInteger;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reviewme.reviewme_backend.application.model.FileAnswer;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query(nativeQuery = true,
            value = "SELECT usr.id FROM users usr "
                    + "WHERE username = " + username)
    Set<BigInteger> function1(String username);

    @Query(nativeQuery = true,
            value = "SELECT usr.id FROM users usr "
                    + "WHERE user_other_field="+user_other_field)
    Set<BigInteger> function2(String user_other_field);
}
