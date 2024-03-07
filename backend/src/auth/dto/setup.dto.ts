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

export class SetupDto {
    @IsString()
    username: string;
}

export class FADTO {
    @IsString()
    code: string;
}
