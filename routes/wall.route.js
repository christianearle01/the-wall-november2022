const { Router } = require('express');

const WallController = require('../controllers/wall.controller');

const WallRoute = Router();

/* Route to post a message */
WallRoute.post('/post_message', (req, res, next) => { new WallController(req, res).postMessage(); });

/* Route to post a comment */
WallRoute.post('/post_comment/:message_id', (req, res, next) => { new WallController(req, res).postComment(); });

/* Route to delete a message */
WallRoute.post('/delete_message/:message_id', (req, res, next) => { new WallController(req, res).deleteMessage(); });

/* Route to delete a comment */
WallRoute.post('/delete_comment/:comment_id', (req, res, next) => { new WallController(req, res).deleteComment(); });

module.exports = WallRoute;