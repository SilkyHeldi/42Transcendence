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

export class SignUpDto {
    @IsString()
    @IsOptional()
    username?: string;
    @IsEmail()
    email: string;
    @IsString()
    password: string;
}
