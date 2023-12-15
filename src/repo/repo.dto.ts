import { ApiProperty } from '@nestjs/swagger';
import { RepoType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRepoDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  owner: string;

  @ApiProperty({
    type: RepoType,
    required: true,
  })
  @IsEnum(RepoType)
  @IsNotEmpty()
  type: RepoType;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  homepage?: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  htmlUrl: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  licenseName?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  licenseUrl?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  created_at: string;

  @ApiProperty({
    type: Array,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  stacks: string;
}

export class UpdateRepoDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  owner?: string;

  @ApiProperty({
    type: RepoType,
    required: false,
  })
  @IsEnum(RepoType)
  @IsOptional()
  type?: RepoType;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  homepage?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  htmlUrl?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  licenseName?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  licenseUrl?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  created_at?: string;

  @ApiProperty({
    type: Array,
    required: false,
  })
  @IsString()
  @IsOptional()
  stacks?: string;
}
