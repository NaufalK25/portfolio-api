import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRepoDto, UpdateRepoDto } from './repo.dto';
import { RepoDtoSchema } from './repo.schema';
import { RepoService } from './repo.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryResponse } from 'src/cloudinary/cloudinary.dto';

@ApiTags('repo')
@Controller('api/repo')
export class RepoController {
  constructor(
    private cloudinaryService: CloudinaryService,
    private repoService: RepoService,
  ) {}

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
  @ApiCreatedResponse({
    description: 'Create new repo successfully!',
  })
  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  async createRepos(
    @Body() dto: CreateRepoDto,
    @UploadedFile() thumbnail: Express.Multer.File,
  ) {
    const uploadResponse = await this.cloudinaryService.uploadImage(thumbnail);
    return this.repoService.createRepo(dto, uploadResponse);
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
    return this.repoService.getAllRepos();
  }

  @ApiOperation({
    summary: 'Delete all repo',
  })
  @ApiNotFoundResponse({
    description: 'Repo not found!',
  })
  @ApiOkResponse({
    description: 'Delete all repo successfully!',
  })
  @Delete()
  deleteAllRepos() {
    return this.repoService.deleteAllRepos();
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
    return this.repoService.getReposByGhId(ghId);
  }

  @ApiOperation({
    summary: 'Update repo by ghId',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: RepoDtoSchema,
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
      uploadResponse = await this.cloudinaryService.uploadImage(thumbnail);
    }
    return this.repoService.updateRepoByGhId(ghId, dto, uploadResponse);
  }

  @ApiOperation({
    summary: 'Delete repo by ghId',
  })
  @ApiNotFoundResponse({
    description: 'Repo not found!',
  })
  @ApiOkResponse({
    description: 'Delete repo with ghId :ghId successfully!',
  })
  @Delete(':ghId')
  deleteReposByGhId(@Param('ghId') ghId: string) {
    return this.repoService.deleteRepoByGhId(ghId);
  }
}
