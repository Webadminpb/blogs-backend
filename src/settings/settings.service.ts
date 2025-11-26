// src/settings/settings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { SettingsDocument, Settings } from './settings.schema';
import { S3Service } from '../lib/s3.service';
import type { Express } from 'express';

@Injectable()
export class SettingsService {
  // constructor uses parameter properties and proper injection for Mongoose model
  constructor(
    @InjectModel('Settings') // or @InjectModel(Settings.name) if you export `Settings` symbol
    private readonly settingsModel: Model<SettingsDocument>,
    private readonly s3Service: S3Service,
  ) {}

  async get() {
    const settings = await this.settingsModel.findOne().exec();
    return settings;
  }

  async getById(id: string) {
    const settings = await this.settingsModel.findById(id).exec();
    if (!settings) throw new NotFoundException('Settings not found');
    return settings;
  }

  async create(data: any) {
    const settings = new this.settingsModel(data);
    return settings.save();
  }

  async update(id: string, data: any) {
    const settings = await this.settingsModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!settings) throw new NotFoundException('Settings not found');
    return settings;
  }

  async seed(settings: any) {
    const existing = await this.settingsModel.findOne().exec();
    if (existing) {
      return this.settingsModel
        .findByIdAndUpdate(existing._id, settings, { new: true })
        .exec();
    }
    return this.create(settings);
  }

  async saveUpload(file: Express.Multer.File) {
    const uploadResult = await this.s3Service.uploadFile(file, 'settings');
    return uploadResult.secure_url;
  }

  async deleteFile(public_id: string): Promise<void> {
    await this.s3Service.deleteFile(public_id);
  }
}
