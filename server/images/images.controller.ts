import { Roles } from '@common/Model/User';
import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequiredRoles } from '@server/common/decorators/roles.decorator';
import { User } from '@server/common/decorators/user.decorator';
import { RolesGuard } from '@server/common/guards/roles.guard';
import { ImagesService } from '@server/images/images.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import fs from 'fs';
import { ServerResponse } from 'http';

@UseGuards(RolesGuard)
@Controller('images')
@ApiTags('images')
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
    description: 'Upload one or multiple images',
  })
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        ids: {
          type: 'array',
          items: {
            type: 'integer',
          },
        },
      },
    },
  })
  @Post()
  async uploadImage(
    @Req() request: FastifyRequest,
    @User('id') userID: number,
  ): Promise<{ success: boolean; ids: number[] }> {
    return await this.imagesService.upload(request, userID);
  }

  @Get(':id')
  async getImage(
    @Param('id', ParseIntPipe) imageID: number,
    @Res() response: FastifyReply<ServerResponse>,
  ): Promise<void> {
    const imageData = await this.imagesService.findById(imageID);

    if (imageData != undefined) {
      response.type('image/jpeg').send(fs.readFileSync(imageData.getPath()));
    } else {
      throw new NotFoundException({ message: 'Image not found' });
    }
  }

  @Get('preview/:id')
  async getImagePreview(
    @Param('id', ParseIntPipe) imageID: number,
    @Res() response: FastifyReply<ServerResponse>,
  ): Promise<void> {
    const imageData = await this.imagesService.findById(imageID);

    if (imageData != undefined) {
      response.type('image/jpeg').send(fs.readFileSync(imageData.getPreviewPath()));
    } else {
      throw new NotFoundException({ message: 'Image not found' });
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequiredRoles(Roles.User)
  @ApiResponse({
    description: 'Delete a single image (either requires admin or uploader)',
  })
  async deleteRecipe(
    @Param('id', ParseIntPipe) id: number,
    @User('roles') roles: Roles[],
    @User('id') userID: number,
  ): Promise<{ success: boolean }> {
    if (roles.some((role) => role == Roles.Admin || role == Roles.Owner)) {
      return await this.imagesService.delete(id);
    } else {
      const owner = (await this.imagesService.findById(id)).uploader;
      if (owner.id == userID) {
        return await this.imagesService.delete(id);
      } else {
        throw new HttpException(
          { message: 'You need to be the uploader of an image to delete it.' },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }
}
