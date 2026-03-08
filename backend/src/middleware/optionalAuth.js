const AUTH0_DOMAIN = process.env.AUTH0_ISSUER_BASE_URL;

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }

        const token = authHeader.split(" ")[1];

        const response = await fetch(`${AUTH0_DOMAIN}/userinfo`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const userInfo = await response.json();
            req.auth = {
                payload: {
                    sub: userInfo.sub,
                    email: userInfo.email,
                },
            };
        }

        next();
    } catch {
        next();
    }
};
