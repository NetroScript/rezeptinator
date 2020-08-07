import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImagesEntity } from '@server/images/images.entity';
import { UserEntity } from '@server/user/user.entity';
import { rejects } from 'assert';
import { createHash, randomBytes } from 'crypto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';
import { Repository } from 'typeorm/index';
import { Readable } from 'stream';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImagesEntity)
    private readonly imageRepository: Repository<ImagesEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async upload(
    request: FastifyRequest,
    userID: number,
  ): Promise<{ success: boolean; ids: number[] }> {
    // If no files are contained throw
    if (!request.isMultipart()) {
      throw new BadRequestException({ message: 'Request is not multipart' });
    }

    const user = await this.userRepository.findOne({ id: userID });

    // The uploaded images
    const images: ImagesEntity[] = [];

    const totalImages: Promise<void>[] = [];

    // Wrap it in a promise to be able to wait till it finishes
    const onWriteEnd = new Promise((resolve, reject) => {
      // The function which handles every file
      const multipart = request.multipart(
        (field: string, file: Readable, filename: string, encoding: string, mimetype: string) => {
          // Create a new promise for each file
          totalImages.push(
            new Promise<void>((currentResolve, currentReject) => {
              // Generate the Image Instance
              const image = new ImagesEntity();
              image.path = randomBytes(32).toString('hex');
              image.uploader = user;
              image.originalName = filename;
              // Create the main output and the thumbnail
              const mainOutput = fs.createWriteStream(image.getPath());
              const thumbOutput = fs.createWriteStream(image.getPreviewPath());
              const mainImage = sharp()
                .resize({
                  width: 2000,
                  height: 2000,
                  withoutEnlargement: true,
                  fit: 'outside',
                })
                .jpeg({ progressive: true, quality: 85 });
              const thumbImage = sharp()
                .resize({
                  width: 100,
                  height: 100,
                  fit: 'cover',
                })
                .jpeg({ progressive: false, quality: 70 });
              file.pipe(mainImage).pipe(mainOutput);
              file.pipe(thumbImage).pipe(thumbOutput);

              // Wait for the image
              const firstPromise = new Promise((resolveFirst) => {
                mainOutput.on('finish', () => {
                  resolveFirst();
                });
              });

              // Wait for the thumbnail
              const secondPromise = new Promise((resolveSecond) => {
                thumbOutput.on('finish', () => {
                  resolveSecond();
                });
              });

              // When both the image and the thumbnail are finished resolve this specific file
              Promise.all([firstPromise, secondPromise]).then(() => {
                images.push(image);
                currentResolve();
              });
            }),
          );
        },
        (error: Error) => {
          // If an error happened, we reject
          if (error) {
            reject(error);
          }

          // When all the files were started to be handled and additionally finished
          // we resolve the main promise
          Promise.all(totalImages).then(() => {
            // When all files in the query finished, finish the main Promise
            resolve(multipart);
          });
        },
      );
    });

    try {
      // Wait for all files to finish
      await onWriteEnd;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }

    await this.imageRepository.save(images);

    return { success: true, ids: images.map((entity) => entity.id) };
  }

  async findById(id: number): Promise<ImagesEntity> {
    return await this.imageRepository.findOne({ id });
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const data = await this.findById(id);

    try {
      await this.imageRepository.remove(data);
    } catch (e) {
      return { success: false };
    }

    return { success: true };
  }
}
