const { Router } = require('express');

const UserRoute = require('./user.route');
const WallRoute = require('./wall.route');

const WallController = require('../controllers/wall.controller');

let APIRoute = (App) => {
    /* Routes to Homepage */
    App.use('/', UserRoute);

    /* Routes for users feature or function */
    App.use('/api/users', UserRoute);

    /* Routes for user to logout */
    App.use('/logout', UserRoute);

    /* Route to visit Wallpage */
    App.use('/wall', (req, res, next) => { new WallController(req, res).wallpage(); });

    /* Route to use Wall features */
    App.use('/api/wall', WallRoute);
}

module.exports = APIRoute;