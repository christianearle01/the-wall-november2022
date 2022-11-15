const { Router } = require('express');

const UserController = require('../controllers/user.controller');

const UserRoute = Router();

/* Route to homepage */
UserRoute.get('/', (req, res, next) => {
    new UserController(req, res).homepage();
});

/* Route to login a user */
UserRoute.post('/login', (req, res, next) => {
    new UserController(req, res).loginUser();
});

/* Route to register a user */
UserRoute.post('/register', (req, res, next) => {
    new UserController(req, res).registerUser();
});

/* Route to logout a user */
UserRoute.get('/logout', (req, res, next) => {
    new UserController(req, res).logoutUser();
});

module.exports = UserRoute;