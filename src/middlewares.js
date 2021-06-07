export const localsMiddleware = (req,res,next)=>{
    res.locals.loggedIn = Boolean(req.sessions.loggedIn);
    res.locals.siteName = "Wetube";
    console.log(res.locals);
    next();

}