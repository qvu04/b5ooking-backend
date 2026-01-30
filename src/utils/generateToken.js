import jwt from 'jsonwebtoken'
export const generateToken = (userId, role, user) => {
    const {password, ...safeuser} = user
    const token = jwt.sign(
        {id : userId , role : role},
        process.env.JWT_SECRET,
        {expiresIn : process.env.JWT_EXPIRES_IN}
    );
    return {
        token_access : token,
        User : safeuser
    };
}

