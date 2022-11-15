const Express       = require('express');
const BodyParser    = require('body-parser');
const Path          = require('path');
const Session       = require('express-session');
const CookieParser  = require('cookie-parser');
const Moment        = require('moment');

const Constants     = require('./config/constants');

const APIRoute      = require('./routes/api.route');

const App = Express();

App.use(BodyParser.json({limit: '50mb'}));
App.use(BodyParser.urlencoded({limit: '50mb', extended: true}));
App.set("view engine", "ejs");
App.set('views', Path.join(__dirname, "/views"));
App.use('/assets', Express.static(Path.join(__dirname, "/assets")));

App.use(Session({
    secret: Constants.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {secure: false, maxAge: Number(Constants.SESSION_EXPIRE) }
}));

App.use(CookieParser(Constants.SESSION_SECRET));

APIRoute(App);

/* Use in ejs file to change format the date time data */
App.locals.moment = Moment;
App.locals.dateTimeFormat = "YYYY-MM-DD hh:mm:ss a";

App.listen(Constants.PORT, () => {
    console.log(`App listening on port ${Constants.PORT}`);
})