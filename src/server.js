// app.use() = can create global middleware, always use -> get, left
import express from "express";
import morgan from "morgan";
import moment from 'moment';
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';
// morgan.token('date',(req,res)=>{
//     return moment().format('HH:mm:ss');
// })

const app = express(); // create application

const logger = morgan("dev");
// const logger = morgan(":date :method :url :status :response-time ms - :res[content-length]")

app.set("view engine", "pug"); //set the engine to pug.
app.set("views",process.cwd()+"/src/views");
app.use(logger);
app.use(express.urlencoded({extended:true})); // form understand
app.use("/",rootRouter);
app.use("/videos", videoRouter);
app.use("/users",userRouter);

export default app;