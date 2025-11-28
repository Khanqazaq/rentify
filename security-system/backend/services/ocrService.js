/**
 * OCR Service - Распознавание текста с документов
 * Интеграция с REGULA, SmartID, Tesseract
 */

const axios = require('axios');
const FormData = require('form-data');
const Tesseract = require('tesseract.js');

class OCRService {
    constructor() {
        this.provider = process.env.OCR_PROVIDER || 'regula';
        this.config = {
            regula: {
                apiKey: process.env.REGULA_API_KEY,
                endpoint: 'https://api.regulaforensics.com/webapi'
            },
            smartid: {
                apiKey: process.env.SMARTID_API_KEY,
                endpoint: 'https://smartid.kz/api/v1'
            },
            tesseract: {
                lang: 'eng+rus+kaz'
            }
        };
    }

    /**
     * Извлечение данных из документа
     */
    async extractData({ frontImageUrl, backImageUrl, documentType, provider = this.provider }) {
        switch (provider) {
            case 'regula':
                return this.extractWithRegula(frontImageUrl, backImageUrl, documentType);
            case 'smartid':
                return this.extractWithSmartID(frontImageUrl, backImageUrl, documentType);
            case 'tesseract':
                return this.extractWithTesseract(frontImageUrl, backImageUrl, documentType);
            default:
                throw new Error(`Unknown OCR provider: ${provider}`);
        }
    }

    /**
     * REGULA Document Reader SDK
     * Профессиональное решение для верификации документов
     */
    async extractWithRegula(frontImageUrl, backImageUrl, documentType) {
        try {
            const formData = new FormData();
            formData.append('apiKey', this.config.regula.apiKey);
            
            // Скачиваем изображения
            const frontImageBuffer = await this.downloadImage(frontImageUrl);
            formData.append('images[]', frontImageBuffer, 'front.jpg');

            if (backImageUrl) {
                const backImageBuffer = await this.downloadImage(backImageUrl);
                formData.append('images[]', backImageBuffer, 'back.jpg');
            }

            formData.append('processParam', JSON.stringify({
                scenario: 'FullProcess',
                resultTypeOutput: ['TEXT', 'IMAGES', 'MRZ_TEXT', 'VISUAL_TEXT'],
                imageQA: {
                    expectedPass: ['dpi', 'focus', 'glares'],
                    focus: true,
                    glares: true,
                    dpi: true
                }
            }));

            const response = await axios.post(
                `${this.config.regula.endpoint}/process`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: 60000
                }
            );

            const result = response.data;

            // Извлекаем данные
            const textFields = result.Text?.fieldList || [];
            const mrzData = result.MRZ;

            return {
                data: {
                    fullName: this.getField(textFields, 'fullName'),
                    firstName: this.getField(textFields, 'firstName'),
                    lastName: this.getField(textFields, 'lastName'),
                    middleName: this.getField(textFields, 'middleName'),
                    iin: this.getField(textFields, 'personalNumber') || mrzData?.personalNumber,
                    dateOfBirth: this.getField(textFields, 'dateOfBirth'),
                    gender: this.getField(textFields, 'sex'),
                    nationality: this.getField(textFields, 'nationality'),
                    documentNumber: this.getField(textFields, 'documentNumber'),
                    issueDate: this.getField(textFields, 'dateOfIssue'),
                    expiryDate: this.getField(textFields, 'dateOfExpiry'),
                    issuedBy: this.getField(textFields, 'authority'),
                    address: this.getField(textFields, 'address')
                },
                confidence: result.QualityResult?.score || 80,
                checks: {
                    mrzValid: result.MRZ?.check === 'passed',
                    barcodeValid: result.Barcode?.check === 'passed',
                    hologramDetected: result.SecurityFeatures?.hologram === true,
                    tamperDetected: result.Authenticity?.status !== 'authentic',
                    photocopyDetected: result.ImageQualityCheck?.photocopyDetected === true
                },
                raw: result
            };

        } catch (error) {
            console.error('REGULA error:', error.response?.data || error.message);
            throw new Error(`REGULA OCR failed: ${error.message}`);
        }
    }

    /**
     * SmartID KZ - для казахстанских документов
     */
    async extractWithSmartID(frontImageUrl, backImageUrl, documentType) {
        try {
            const formData = new FormData();
            
            const frontImageBuffer = await this.downloadImage(frontImageUrl);
            formData.append('front', frontImageBuffer, 'front.jpg');

            if (backImageUrl) {
                const backImageBuffer = await this.downloadImage(backImageUrl);
                formData.append('back', backImageBuffer, 'back.jpg');
            }

            formData.append('doc_type', this.mapDocumentType(documentType));

            const response = await axios.post(
                `${this.config.smartid.endpoint}/recognize`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.smartid.apiKey}`,
                        ...formData.getHeaders()
                    },
                    timeout: 45000
                }
            );

            const data = response.data;

            return {
                data: {
                    fullName: data.fullName || `${data.surname} ${data.name} ${data.patronymic || ''}`.trim(),
                    firstName: data.name,
                    lastName: data.surname,
                    middleName: data.patronymic,
                    iin: data.iin,
                    dateOfBirth: data.birthDate,
                    gender: data.sex === 'М' ? 'M' : 'F',
                    nationality: data.nationality || 'KZ',
                    documentNumber: data.documentNumber,
                    issueDate: data.issueDate,
                    expiryDate: data.expiryDate,
                    issuedBy: data.issuedBy,
                    address: data.address
                },
                confidence: data.confidence || 85,
                checks: {
                    mrzValid: data.mrzValid || false,
                    barcodeValid: data.barcodeValid || false,
                    hologramDetected: false,
                    tamperDetected: data.tamperDetected || false,
                    photocopyDetected: data.photocopy || false
                },
                raw: data
            };

        } catch (error) {
            console.error('SmartID error:', error.response?.data || error.message);
            throw new Error(`SmartID OCR failed: ${error.message}`);
        }
    }

    /**
     * Tesseract.js - бесплатная альтернатива (низкая точность)
     */
    async extractWithTesseract(frontImageUrl, backImageUrl, documentType) {
        try {
            const frontImageBuffer = await this.downloadImage(frontImageUrl);

            const { data: { text, confidence } } = await Tesseract.recognize(
                frontImageBuffer,
                this.config.tesseract.lang,
                {
                    logger: m => console.log(m)
                }
            );

            // Простой парсинг (низкая точность!)
            const iinMatch = text.match(/\d{12}/);
            const nameMatch = text.match(/[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+/);

            return {
                data: {
                    fullName: nameMatch ? nameMatch[0] : null,
                    iin: iinMatch ? iinMatch[0] : null,
                    // Остальные поля требуют сложного парсинга
                },
                confidence: Math.min(confidence, 65), // Tesseract менее точен
                checks: {
                    mrzValid: false,
                    barcodeValid: false,
                    hologramDetected: false,
                    tamperDetected: false,
                    photocopyDetected: false
                },
                raw: { text, confidence }
            };

        } catch (error) {
            console.error('Tesseract error:', error);
            throw new Error(`Tesseract OCR failed: ${error.message}`);
        }
    }

    /**
     * Скачивание изображения из URL
     */
    async downloadImage(url) {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000
        });
        return Buffer.from(response.data);
    }

    /**
     * Получение поля из массива полей REGULA
     */
    getField(fields, fieldName) {
        const field = fields.find(f => 
            f.fieldName?.toLowerCase() === fieldName.toLowerCase() ||
            f.lcid === this.getFieldLCID(fieldName)
        );
        return field?.value || null;
    }

    /**
     * LCID коды полей для REGULA
     */
    getFieldLCID(fieldName) {
        const lcids = {
            'fullName': 106,
            'firstName': 107,
            'lastName': 108,
            'middleName': 109,
            'dateOfBirth': 103,
            'personalNumber': 21,
            'documentNumber': 0,
            'dateOfExpiry': 102,
            'dateOfIssue': 101,
            'nationality': 104,
            'sex': 105,
            'authority': 110,
            'address': 111
        };
        return lcids[fieldName];
    }

    /**
     * Маппинг типов документов
     */
    mapDocumentType(type) {
        const mapping = {
            'id_card': 'ID_CARD',
            'passport': 'PASSPORT',
            'driving_license': 'DRIVER_LICENSE'
        };
        return mapping[type] || 'ID_CARD';
    }
}

module.exports = new OCRService();
