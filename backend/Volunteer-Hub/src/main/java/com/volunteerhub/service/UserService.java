package com.volunteerhub.service;

import com.volunteerhub.model.User;
import java.util.List;

public interface UserService {
    User register(User user);
    User login(String email, String password);
    List<User> getAllUsers();
    User getUserById(Long id);
    User updateUser(Long id, User user);
    void deleteUser(Long id);
    List<User> getUsersByRole(User.Role role);
}
