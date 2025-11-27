import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSubmenuDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  parent_id!: Types.ObjectId;

  @IsOptional()
  @IsBoolean()
  showOnHomePage?: boolean;
}
