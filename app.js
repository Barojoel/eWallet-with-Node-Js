const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const routes = require('./routes/index');

const transactionRoutes = require('./routes/transactions');
const walletRoutes = require ('./routes/wallets');

const appRoutes = require('./routes/app');

const errorsHandler = require('./middlewares/errors');


const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

mongoose.set("strictQuery", false);

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('Connected to database'))
  .catch(err => console.log(err));

  // EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Express body parser/
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );
  
  // Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

app.use('/', routes);
app.use('/app', appRoutes);

//Calling APIs for Wallet and Income/Expenses Accounts
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);

app.use(errorsHandler.notFound);
app.use(errorsHandler.catchErrors);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on  ${PORT}`));
