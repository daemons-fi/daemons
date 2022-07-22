import { utils } from 'ethers';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';


export function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, payload: any) => {
        if (err) return res.sendStatus(403);

        req.userAddress = utils.getAddress(payload.userAddress);
        next();
    });
}
