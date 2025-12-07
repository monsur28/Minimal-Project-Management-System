declare global {
    namespace Express {
        interface UserPayload {
            _id: string;
            name?: string;
            email?: string;
            role?: "admin" | "manager" | "member" | string;
        }

        interface Request {
            user?: UserPayload;
        }
    }
}

export { };
