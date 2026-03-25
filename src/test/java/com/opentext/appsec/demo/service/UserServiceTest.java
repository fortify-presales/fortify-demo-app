package com.opentext.appsec.demo.service;

import com.opentext.appsec.demo.model.User;
import com.opentext.appsec.demo.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private UserService userService;

    @Test
    void authenticateUser_successAndFailure() {
        User user = new User("bob", "secret", "bob@example.com", "USER");
        when(userRepository.findByUsername("bob")).thenReturn(user);

        assertTrue(userService.authenticateUser("bob", "secret"));
        assertFalse(userService.authenticateUser("bob", "wrong"));
    }

    @Test
    void createUser_and_getAllUsers() {
        User u1 = new User("a","p","a@e","USER");
        when(userRepository.save(u1)).thenReturn(u1);
        when(userRepository.findAll()).thenReturn(List.of(u1));

        User created = userService.createUser(u1);
        assertSame(u1, created);

        List<User> all = userService.getAllUsers();
        assertEquals(1, all.size());
        assertEquals("a", all.get(0).getUsername());
    }

    @Test
    void findUserByUsername_usesEntityManager() {
        User u = new User("x","p","x@e","USER");
        Query q = mock(Query.class);
        when(entityManager.createNativeQuery(anyString(), eq(User.class))).thenReturn(q);
        when(q.getResultList()).thenReturn(List.of(u));

        User res = userService.findUserByUsername("x");
        assertNotNull(res);
        assertEquals("x", res.getUsername());
    }

    @Test
    void searchUsers_usesEntityManager() {
        User u = new User("s","p","s@e","USER");
        Query q = mock(Query.class);
        when(entityManager.createNativeQuery(anyString(), eq(User.class))).thenReturn(q);
        when(q.getResultList()).thenReturn(List.of(u));

        List<User> results = userService.searchUsers("s");
        assertEquals(1, results.size());
        assertEquals("s", results.get(0).getUsername());
    }
}
