import User from '../models/User';
import bcrypt from 'bcrypt'
export const getJoin = (req,res) => {
    res.render("join" , {pageTitle:"Join"});
}

export const postJoin = async(req,res) => {
    const {name, username,email,password,password2,location} = req.body;
    const exists = await User.exists({$or: [{username}, {email}]});
    const pageTitle = "Join";
    if(password !== password2){
        return res.status(400).render("join",{
            pageTitle,
            errorMessage : "Password confirmation does not match."
        });
    }

    if(exists){
        return res.status(400).render("join",{
            pageTitle,
            errorMessage:"This username / email is already taken."
        });
    }
    try{
        await User.create({
            name,username,email,password,location
        });
        res.redirect('/login');
    }catch(e){
        return res.status(400).render("join",{
            pageTitle,
            errorMessage : e._message
        })
    }
};

export const getLogin = (req,res) => {
    return res.render("login",{pageTitle:'Login'})
}

export const postLogin = async(req,res) =>{
    const {username,password} = req.body;
    const user = await User.findOne({username});
    if(!user){
        return res.status(400).render("login",{
            pageTitle,
            eroorMessage:"An account with this username does not exists."
        })
    }
    const ok = await bcrypt.compare(password,user.password);
    if(!ok){
        return res.status(400).render("login",{
            pageTitle,
            errorMessage : "Wrong password"
        })
    }
    req.session.loggdedIn - true;
    req.session.user = user;
    
    return res.redirect("/");
}

export const edit = (req,res) => res.send("edit User" );
export const remove = (req,res) => res.send("remove User")
export const logout = (req,res) => res.send("Log Out");
export const see = (req,res) => res.send("See User");