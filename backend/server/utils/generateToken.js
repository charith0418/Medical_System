const jwt = require('jsonwebtoken');

const generateToken = (res, userId, role, rememberMe) => {
    const isRemembered = role === 'Admin' ? false : rememberMe;
    const expiresIn = isRemembered ? '30d' : '1h';
    
    // Fallback secret ensures alignment across environment setups
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';

    const token = jwt.sign({ userId, role }, secret, {
        expiresIn
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: isRemembered ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, 
    });

    return token;
};

module.exports = generateToken;