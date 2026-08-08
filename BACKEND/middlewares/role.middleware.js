const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        // User must already be authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        // Check role
        if (!allowedRoles.includes(req.user.role)) {

            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource."
            });
        }

        next();
    };
};

module.exports = authorizeRoles;