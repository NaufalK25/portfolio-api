import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateRepoDto, UpdateRepoDto } from './repo.dto';
import { RepoDtoSchema } from './repo.schema';
import { RepoService } from './repo.service';
import { JwtGuard } from 'src/auth/guard';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryResponse } from 'src/cloudinary/cloudinary.dto';

@ApiTags('repo')
@Controller('api/repo')
export class RepoController {
  constructor(
    private cloudinary: CloudinaryService,
    private repo: RepoService,
  ) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary: 'Create new repo',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: RepoDtoSchema,
  })
  @ApiBadRequestResponse({
    description: 'Validation error!',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized!',
  })
  @ApiCreatedResponse({
    description: 'Create new repo successfully!',
  })
  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  async createRepos(
    @Body() dto: CreateRepoDto,
    @UploadedFile() thumbnail: Express.Multer.File,
  ) {
    const uploadResponse = await this.cloudinary.uploadImage(
      dto.name,
      thumbnail,
    );
    return this.repo.createRepo(dto, uploadResponse);
  }

  @ApiOperation({
    summary: 'Get all repo',
  })
  @ApiNotFoundResponse({
    description: 'Repo not found!',
  })
  @ApiOkResponse({
    description: 'Get all repo successfully!',
  })
  @Get()
  getAllRepos() {
    return this.repo.getAllRepos();
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary: 'Delete all repo',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized!',
  })
  @ApiNotFoundResponse({
    description: 'Repo not found!',
  })
  @ApiOkResponse({
    description: 'Delete all repo successfully!',
  })
  @Delete()
  deleteAllRepos() {
    return this.repo.deleteAllRepos();
  }

  @ApiOperation({
    summary: 'Get repo by ghId',
  })
  @ApiNotFoundResponse({
    description: 'Repo not found!',
  })
  @ApiOkResponse({
    description: 'Get repo with ghId :ghId successfully!',
  })
  @Get(':ghId')
  getReposByGhId(@Param('ghId') ghId: string) {
    return this.repo.getReposByGhId(ghId);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary: 'Update repo by ghId',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: RepoDtoSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized!',
  })
  @ApiNotFoundResponse({
    description: 'Repo not found!',
  })
  @ApiOkResponse({
    description: 'Update repo with ghId :ghId successfully!',
  })
  @Patch(':ghId')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async updateReposByGhId(
    @Param('ghId') ghId: string,
    @Body() dto: UpdateRepoDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ) {
    let uploadResponse: CloudinaryResponse;
    if (thumbnail) {
      uploadResponse = await this.cloudinary.uploadImage(dto.name, thumbnail);
    }
    return this.repo.updateRepoByGhId(ghId, dto, uploadResponse);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary: 'Delete repo by ghId',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized!',
  })
  @ApiNotFoundResponse({
    description: 'Repo not found!',
  })
  @ApiOkResponse({
    description: 'Delete repo with ghId :ghId successfully!',
  })
  @Delete(':ghId')
  deleteReposByGhId(@Param('ghId') ghId: string) {
    return this.repo.deleteRepoByGhId(ghId);
  }
}
