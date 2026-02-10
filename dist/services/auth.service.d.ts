import { LoginRequest, RegisterRequest, TokenResponse, AuthUser } from '../types';
export declare class AuthService {
    register(data: RegisterRequest): Promise<TokenResponse>;
    login(data: LoginRequest): Promise<TokenResponse>;
    logout(userId: string): Promise<void>;
    refreshToken(refreshToken: string): Promise<TokenResponse>;
    getCurrentUser(userId: string): Promise<AuthUser | null>;
    updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
    resetPassword(email: string, newPassword: string): Promise<void>;
    forgotPassword(email: string): Promise<string>;
    resetPasswordWithToken(resetToken: string, newPassword: string): Promise<void>;
    private generateTokens;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map