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

export class ChannelIdDto {
    @IsNumber()
    channelId: number;
    @IsOptional()
    show: boolean;
}
export class ChannelCreateDTO {
    @IsString()
    name: string;
    @IsString()
    type: string;
    @IsString()
    @IsOptional()
    password?: string;
}

export class UserIdDto {
    @IsNumber()
    userId: number;
}
