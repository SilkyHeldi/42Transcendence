export interface UpdateUserDto {
    email?: string;
    password?: string;
    username?: string;
    avatar?: string | Express.Multer.File;
    mfaEnabled?: boolean;
    mfaCode?: string;
    changePassword?: boolean;

    //socketId?: string;
    //status?: string;
    //twoFa?: number;
}
