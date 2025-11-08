import {
  IsAlpha,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsAlpha()
  firstName: string;

  @IsString()
  @IsAlpha()
  lastName: string;

  @IsOptional()
  @IsPhoneNumber('GB', { message: 'phone must be E.164 or valid GB number' })
  phone?: string;
}
