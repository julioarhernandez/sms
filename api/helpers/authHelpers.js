
exports.securedToken = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else{
        res.sendStatus(403);
    }
}
exports.isUserAuthenticated = (req) => {
    return ( req.body.user == process.env.USERNAME);
}
exports.getSecureKey = () => {
    return process.env.SECRET;
}


