const passport = require('passport')
const googleStrategy = require('passport-google-oauth2').Strategy
const facebookStrategy = require('passport-facebook').Strategy

passport.serializeUser((user,done)=>{
    done(null, user)
})

passport.deserializeUser((user,done)=>{
    done(null, user)
})

passport.use(new googleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback:true
},
function(request,accessToken,refreshToken,profile,done){
    console.log(profile);
    return done(null,profile)
}
))

passport.use(new facebookStrategy({
    clientID:process.env.FACEBOOK_CLIENT_ID,
    clientSecret:process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL:process.env.FACEBOOK_CALLBACK_URL,
    profileFields:['id','displayName','name','gender','picture.type(large)','email']
},
function(token,refreshToken,profile,done){
    console.log(profile);
    return done(null,profile)
}
))