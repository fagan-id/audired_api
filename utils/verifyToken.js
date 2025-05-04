const { auth } = require("../firebase")

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const idToken = token.split(' ')[1];


    try{
        const decoded = await auth.verifyIdToken(idToken);
        req.user = decoded;
        next();
    }
    catch(error){
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
}

module.exports = verifyToken;