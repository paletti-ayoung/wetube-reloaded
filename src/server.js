import express from "express";

const PORT = 4000;

const app = express(); // create application

const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
}

const privateMiddleware=(req,res,next)=>{
    const url =req.url;
    if(url === '/protected'){
        return res.send("<h1>Not Allowed</h1>")
    } 
    console.log('Allowed. you may call')
    next();
}

const handleHome = (req,res) =>{
    return res.send('I love middlewares')
}

const handleProtected = (req,res) =>{
    return res.send("Welcome to private lounge.");
}

app.use(logger) // app.use() = can create global middleware, always use -> get, left
app.use(privateMiddleware);
app.get ('/' , handleHome);
app.get('/protected',handleProtected)

const handleListening = () => console.log(`✅ Server listenting on port http://localhost:${PORT} 🌈`);

app.listen(PORT, handleListening);
