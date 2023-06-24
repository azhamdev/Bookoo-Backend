import SequelizeSession from 'connect-session-sequelize';
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import session from "express-session";
import db from './config/Database.js';
import AuthRoute from './routes/AuthRoute.js';
import ProductRoute from './routes/ProductRoute.js';
import UserRoute from './routes/UserRoute.js';
import FreeRoute from './routes/FreeRoute.js'

dotenv.config();
// (async () => {
//   await db.sync(
//     { force: true }
//   )
// })()

const app = express();

const sessionStore = SequelizeSession(session.Store);


const store = new sessionStore({
  db: db
})


app.use(session({
  secret: process.env.SESS_SECRET,
  resave: false,
  saveUninitialized: true,
  store: store,
  cookie: {
    secure: 'auto',
  }
}))

app.use(cors({
  credentials: true,
  origin: "http://localhost:3000"
}))

app.use(express.json());
app.use(fileUpload())
app.use(express.static("public"));
app.use(UserRoute);
app.use(ProductRoute);
app.use(FreeRoute);
app.use(AuthRoute);


store.sync();

app.listen(process.env.APP_PORT, () => {
  console.log('Server up and running ..')
});