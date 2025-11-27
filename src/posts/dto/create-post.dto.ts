import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class BlogAuthorDto {
  @IsString()
  _id!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreatePostDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsArray()
  @IsString({ each: true })
  menus!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  submenus?: string[];

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlogAuthorDto)
  authors!: BlogAuthorDto[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsOptional()
  @IsString()
  shareUrl?: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  index?: number;
}
