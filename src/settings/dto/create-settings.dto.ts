import {
  IsString,
  IsOptional,
  IsUrl,
  IsEnum,
  IsInt,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SocialDto {
  @IsOptional()
  @IsUrl({}, { message: 'Facebook must be a valid URL' })
  facebook?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Twitter must be a valid URL' })
  twitter?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Instagram must be a valid URL' })
  instagram?: string;

  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn must be a valid URL' })
  linkedin?: string;
}

export class CreateSettingsDto {
  @IsString({ message: 'Site name must be a string' })
  siteName!: string;

  @IsString({ message: 'Site description must be a string' })
  siteDescription!: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo must be a valid URL' })
  logo?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Favicon must be a valid URL' })
  favicon?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialDto)
  social?: SocialDto;

  @IsOptional()
  @IsEnum(['light', 'dark', 'system'], {
    message: 'Theme must be one of: light, dark, system',
  })
  theme?: 'light' | 'dark' | 'system';

  @IsOptional()
  @IsInt({ message: 'Posts per page must be an integer' })
  @Min(1, { message: 'Minimum posts per page is 1' })
  @Max(50, { message: 'Maximum posts per page is 50' })
  postsPerPage?: number;
}
