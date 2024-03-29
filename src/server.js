// app.use() = can create global middleware, always use -> get, left

import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from 'express-flash';
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';
import { localsMiddleware } from "./middlewares";
import apiRouter from "./routers/apiRouter";
// morgan.token('date',(req,res)=>{
//     return moment().format('HH:mm:ss');
// })

const app = express(); // create application
const logger = morgan("dev");
// const logger = morgan(":date :method :url :status :response-time ms - :res[content-length]")

app.set("view engine", "pug"); //set the engine to pug.
app.set("views",process.cwd()+"/src/views");
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({extended:true})); // form understand

app.use(
    session({
    secret:process.env.COOKIE_SECRET,
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({mongoUrl:process.env.DB_URL}),

}));

app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/",rootRouter);
app.use("/videos", videoRouter);
app.use("/users",userRouter);
app.use("/api",apiRouter);

export default app;