import User from '../models/User';
import Video from '../models/Video';
import bcrypt from 'bcrypt';
import fetch from "node-fetch";

export const getJoin = (req, res) => {
    res.render("join", { pageTitle: "Join" });
}

export const postJoin = async (req, res) => {
    const { name, username, email, password, password2, location } = req.body;
    const exists = await User.exists({ $or: [{ username }, { email }] });
    const pageTitle = "Join";
    if (password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Password confirmation does not match."
        });
    }

    if (exists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "This username / email is already taken."
        });
    }
    try {
        await User.create({
            name, username, email, password, location
        });
        res.redirect('/login');
    } catch (e) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: e._message
        })
    }
};

export const getLogin = (req, res) => {
    return res.render("login", { pageTitle: 'Login' })
}

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, socialOnly: false });
    const pageTitle = 'Login';

    if (!user) {
        return res.status(400).render("login", {
            pageTitle,
            eroorMessage: "An account with this username does not exists."
        })
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong password"
        })
    }

    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}
export const startGithubLogin = (req, res) => {
    const baseUrl = 'https://github.com/login/oauth/authorize'
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_singup: false,
        scope: "read:user user:email",
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`
    return res.redirect(finalUrl)
}

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (await fetch(finalUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    })).json();

    if ("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`
                }
            })).json();

        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                }
            })).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if (!emailObj) {
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email });
        if (!user) {
            user = User.create({
                avartarUrl: userData.avatar_url,
                name: userData.name ? userData.name : "Unkown",
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.loacation,
            });
        }

        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");

    } else {
        return res.redirect("/login");
    }

};


export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
}

export const postEdit = async (req, res) => {
    const { session: {
        user: { _id,avatarUrl , email : sessionEmail, username : sessionUsername }
        },
        body : {
            name, 
            email,
            username,
            location},
            file,
    } = req;
    let searchParams= [];
    if(sessionEmail !== email){
        searchParams.push({email})
    }
    if(sessionUsername !== username){
        searchParams.push({username});
    }
    if(searchParams.length>0){
        const foundUser = await User.findOne({$or : searchParams});
        if(foundUser && foundUser._id.toString()!== _id){
            return res.status(400).render("edit-profile",{
                pageTitle:"Edit Profile",
                errorMessage : "This username/email is alreay taken"
            })
        }
    }
    const updatedUser = await User.findByIdAndUpdate(_id,{
        avatarUrl : file ? file.path : avatarUrl,
        name,
        email,
        username,
        location
    },{new : true});

    req.session.user = updatedUser;
    return res.redirect("/users/edit");
}

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/")
}

export const getChangePassword = (req,res ) =>{
    if(req.session.socialOnly === true){
        return res.redirect("/");
    }
    return res.render("users/change-password",{pageTitle:"Change Password"});
}

export const postChangePassword = async(req,res) =>{
    const {
        session:{
            user:{ _id},
        },
        body:{oldPassword,newPassword, newPasswordCon},
    } = req;
    const user = await User.findById(_id);
    const ok = await bcrypt.compare(oldPassword,user.password);
 
    if(!ok){
        return res.status(400).render("users/change-password",{
            pageTitle:"Change Password",
            errorMessage : "The current password is incorrect"
        })
    }

    if(newPassword !== newPasswordCon){
        return res.status(400).render("users/change-password",{
            pageTitle: "Change Password",
            errorMessage : "The password does not match the confirmation"
        });
    }

    // const user = await User.findById(_id); // for hasing new password;
    user.password = newPassword;
    await user.save(); // we should update session too.
    
    return res.redirect("/users/logout");
}

export const see = async(req, res) => {
    const {id} = req.params;
    const user = await User.findById(id).populate("videos");
    if(!user){
        return res.status(404).render("404",{pageTitle:"User not found."})
    }
    return res.render("users/profile", {pageTitle : user.name,user});
}
