/**
 * Storage Service - AWS S3 / Firebase Storage
 * Для загрузки и хранения изображений/видео
 */

const AWS = require('aws-sdk');
const crypto = require('crypto');
const sharp = require('sharp');

class StorageService {
    constructor() {
        this.provider = process.env.STORAGE_PROVIDER || 'aws';
        
        if (this.provider === 'aws') {
            this.s3 = new AWS.S3({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION || 'us-east-1'
            });
            this.bucket = process.env.AWS_S3_BUCKET;
        }
    }

    /**
     * Загрузка изображения
     */
    async uploadImage(file, userId, type = 'general') {
        try {
            // Оптимизация изображения
            const optimizedBuffer = await sharp(file.buffer)
                .resize(1920, 1920, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 85 })
                .toBuffer();

            const hash = crypto.createHash('sha256')
                .update(optimizedBuffer)
                .digest('hex');

            const filename = `${userId}/${type}/${Date.now()}_${hash.substring(0, 12)}.jpg`;

            if (this.provider === 'aws') {
                return this.uploadToS3(optimizedBuffer, filename, 'image/jpeg');
            } else {
                return this.uploadToFirebase(optimizedBuffer, filename, 'image/jpeg');
            }

        } catch (error) {
            console.error('Upload image error:', error);
            throw new Error('Image upload failed');
        }
    }

    /**
     * Загрузка видео
     */
    async uploadVideo(file, userId) {
        try {
            const hash = crypto.createHash('sha256')
                .update(file.buffer)
                .digest('hex');

            const filename = `${userId}/liveness/${Date.now()}_${hash.substring(0, 12)}.${file.originalname.split('.').pop()}`;

            if (this.provider === 'aws') {
                return this.uploadToS3(file.buffer, filename, file.mimetype);
            } else {
                return this.uploadToFirebase(file.buffer, filename, file.mimetype);
            }

        } catch (error) {
            console.error('Upload video error:', error);
            throw new Error('Video upload failed');
        }
    }

    /**
     * Загрузка в AWS S3
     */
    async uploadToS3(buffer, filename, contentType) {
        const params = {
            Bucket: this.bucket,
            Key: filename,
            Body: buffer,
            ContentType: contentType,
            ACL: 'private', // Приватный доступ
            ServerSideEncryption: 'AES256' // Шифрование
        };

        const result = await this.s3.upload(params).promise();

        // Генерация временного URL (действителен 24 часа)
        const url = this.s3.getSignedUrl('getObject', {
            Bucket: this.bucket,
            Key: filename,
            Expires: 24 * 60 * 60
        });

        return {
            url,
            permanentUrl: result.Location,
            key: filename,
            hash: crypto.createHash('sha256').update(buffer).digest('hex')
        };
    }

    /**
     * Загрузка в Firebase Storage
     */
    async uploadToFirebase(buffer, filename, contentType) {
        // TODO: Implement Firebase Storage upload
        throw new Error('Firebase storage not implemented yet');
    }

    /**
     * Удаление файла
     */
    async deleteFile(url) {
        try {
            if (this.provider === 'aws') {
                // Извлекаем ключ из URL
                const key = url.split('.com/')[1]?.split('?')[0];
                
                if (!key) return;

                await this.s3.deleteObject({
                    Bucket: this.bucket,
                    Key: key
                }).promise();

                console.log(`Deleted file: ${key}`);
            }
        } catch (error) {
            console.error('Delete file error:', error);
        }
    }

    /**
     * Удаление видео
     */
    async deleteVideo(url) {
        return this.deleteFile(url);
    }

    /**
     * Удаление изображения
     */
    async deleteImage(url) {
        return this.deleteFile(url);
    }
}

module.exports = new StorageService();
