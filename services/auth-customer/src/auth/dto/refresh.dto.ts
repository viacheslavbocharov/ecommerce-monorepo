import { IsString } from 'class-validator';

export class RefresfDto {
  @IsString()
  refreshToken: string;
}
