import { Response } from 'express';
export declare class UsersController {
    createUser: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getUsers: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getUserById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    searchUsers: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateUser: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deactivateUser: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    createRole: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getRoles: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getRoleById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateRole: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteRole: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getPermissions: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const usersController: UsersController;
//# sourceMappingURL=users.controller.d.ts.map