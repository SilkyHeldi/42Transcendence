import {
    ArrayNotEmpty,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    ValidateNested,
    Min,
    Max,
    IsNumber,
    IsOptional,
    IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDto {
    @IsString()
    username: string;
    @IsString()
    @IsEmail()
    email: string;
    @IsString()
    password: string;
    @IsString()
    @IsOptional()
    newPassword: string;
    @IsString()
    @IsOptional()
    newPasswordConfirmation: string;
    @IsString()
    avatar: string;
}
