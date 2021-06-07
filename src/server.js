// app.use() = can create global middleware, always use -> get, left
import express from "express";
import morgan from "morgan";
import globalRouter from './routers/globalRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';


const app = express(); // create application

const logger = morgan("dev");

app.set("view engine", "pug"); //set the engine to pug.
app.set("views",process.cwd()+"/src/views");
app.use(logger);
app.use(express.urlencoded({extended:true})); // form understand
app.use("/",globalRouter);
app.use("/videos", videoRouter);
app.use("/users",userRouter);

export default app;