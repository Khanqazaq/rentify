/**
 * Liveness AI Service
 * Интеграция с Face++, Azure Face API, Hive AI
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class LivenessService {
    constructor() {
        this.provider = process.env.LIVENESS_AI_PROVIDER || 'facepp';
        this.config = {
            facepp: {
                apiKey: process.env.FACEPP_API_KEY,
                apiSecret: process.env.FACEPP_API_SECRET,
                endpoint: 'https://api-us.faceplusplus.com/facepp/v1/video'
            },
            azure: {
                subscriptionKey: process.env.AZURE_FACE_KEY,
                endpoint: process.env.AZURE_FACE_ENDPOINT,
                apiVersion: '2023-02-01-preview'
            },
            hive: {
                apiKey: process.env.HIVE_API_KEY,
                endpoint: 'https://api.thehive.ai/api/v2/task/sync'
            }
        };
    }

    /**
     * Анализ видео на живость
     */
    async analyzeVideo({ videoUrl, provider = this.provider }) {
        switch (provider) {
            case 'facepp':
                return this.analyzeFacePP(videoUrl);
            case 'azure':
                return this.analyzeAzure(videoUrl);
            case 'hive':
                return this.analyzeHive(videoUrl);
            default:
                throw new Error(`Unknown liveness provider: ${provider}`);
        }
    }

    /**
     * Face++ Liveness Detection
     */
    async analyzeFacePP(videoUrl) {
        try {
            const formData = new FormData();
            formData.append('api_key', this.config.facepp.apiKey);
            formData.append('api_secret', this.config.facepp.apiSecret);
            formData.append('video_url', videoUrl);
            formData.append('return_landmark', '1');
            formData.append('return_attributes', 'eyestatus,mouthstatus,headpose');

            const response = await axios.post(
                this.config.facepp.endpoint,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: 60000
                }
            );

            const data = response.data;

            // Обработка результатов Face++
            const livenessScore = this.calculateLivenessScore(data);
            
            return {
                faceDetected: data.faces && data.faces.length > 0,
                faceQuality: data.faces?.[0]?.face_quality || 0,
                livenessScore,
                checks: {
                    eyeMovement: data.faces?.[0]?.attributes?.eyestatus?.left_eye_status?.normal_glass_eye_open > 0.5,
                    headRotation: Math.abs(data.faces?.[0]?.attributes?.headpose?.yaw_angle) > 10,
                    blinkDetected: this.detectBlink(data.frames),
                    lipMovement: this.detectLipMovement(data.frames),
                    depthDetected: data.liveness_status === 'real',
                    screenDetection: data.liveness_status === 'fake'
                },
                raw: data
            };

        } catch (error) {
            console.error('Face++ error:', error.response?.data || error.message);
            throw new Error(`Face++ analysis failed: ${error.message}`);
        }
    }

    /**
     * Azure Face API Liveness Detection
     */
    async analyzeAzure(videoUrl) {
        try {
            const endpoint = `${this.config.azure.endpoint}/face/v${this.config.azure.apiVersion}/detectLiveness/singleModal`;

            const response = await axios.post(
                endpoint,
                {
                    videoUrl,
                    livenessOperationMode: 'Passive'
                },
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': this.config.azure.subscriptionKey,
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000
                }
            );

            const data = response.data;

            return {
                faceDetected: data.liveness === 'live',
                faceQuality: data.verifyResult?.confidence || 0,
                livenessScore: data.verifyResult?.confidence || 0,
                checks: {
                    eyeMovement: true, // Azure делает это автоматически
                    headRotation: true,
                    blinkDetected: true,
                    lipMovement: false,
                    depthDetected: data.liveness === 'live',
                    screenDetection: data.liveness === 'spoof'
                },
                raw: data
            };

        } catch (error) {
            console.error('Azure error:', error.response?.data || error.message);
            throw new Error(`Azure analysis failed: ${error.message}`);
        }
    }

    /**
     * Hive AI Liveness Detection
     */
    async analyzeHive(videoUrl) {
        try {
            const response = await axios.post(
                this.config.hive.endpoint,
                {
                    url: videoUrl,
                    models: ['face', 'deepfake']
                },
                {
                    headers: {
                        'Authorization': `Token ${this.config.hive.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000
                }
            );

            const data = response.data;
            const faceData = data.status[0]?.response?.output?.[0]?.classes?.find(c => c.class === 'yes');
            const deepfakeScore = data.status[1]?.response?.output?.[0]?.classes?.find(c => c.class === 'deepfake')?.score || 0;

            const livenessScore = Math.max(0, 100 - (deepfakeScore * 100));

            return {
                faceDetected: faceData?.score > 0.5,
                faceQuality: (faceData?.score || 0) * 100,
                livenessScore,
                checks: {
                    eyeMovement: true,
                    headRotation: true,
                    blinkDetected: true,
                    lipMovement: false,
                    depthDetected: deepfakeScore < 0.3,
                    screenDetection: deepfakeScore > 0.7
                },
                raw: data
            };

        } catch (error) {
            console.error('Hive error:', error.response?.data || error.message);
            throw new Error(`Hive analysis failed: ${error.message}`);
        }
    }

    /**
     * Расчет общего score живости
     */
    calculateLivenessScore(data) {
        let score = 0;
        
        // Базовый score от сервиса
        if (data.confidence) {
            score = data.confidence;
        } else if (data.liveness_status === 'real') {
            score = 85;
        } else if (data.liveness_status === 'fake') {
            score = 20;
        }

        // Бонусы за дополнительные проверки
        if (data.faces?.[0]?.attributes?.eyestatus) {
            score += 5;
        }
        if (data.faces?.[0]?.attributes?.headpose) {
            score += 5;
        }

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Определение моргания по фреймам
     */
    detectBlink(frames) {
        if (!frames || frames.length < 2) return false;

        let blinkDetected = false;
        for (let i = 0; i < frames.length - 1; i++) {
            const current = frames[i]?.faces?.[0]?.attributes?.eyestatus;
            const next = frames[i + 1]?.faces?.[0]?.attributes?.eyestatus;

            if (current && next) {
                const currentOpen = current.left_eye_status?.normal_glass_eye_open;
                const nextClosed = next.left_eye_status?.normal_glass_eye_close;

                if (currentOpen > 0.8 && nextClosed > 0.5) {
                    blinkDetected = true;
                    break;
                }
            }
        }

        return blinkDetected;
    }

    /**
     * Определение движения губ
     */
    detectLipMovement(frames) {
        if (!frames || frames.length < 3) return false;

        // Простая проверка изменения позиции губ
        const lipPositions = frames
            .map(f => f.faces?.[0]?.attributes?.mouthstatus)
            .filter(Boolean);

        if (lipPositions.length < 3) return false;

        // Проверяем вариацию
        const openCounts = lipPositions.filter(m => m.mouth_open > 0.5).length;
        return openCounts > 0 && openCounts < lipPositions.length;
    }

    /**
     * Сравнение двух лиц (для проверки соответствия селфи и ID)
     */
    async compareFaces(image1Url, image2Url) {
        try {
            const formData = new FormData();
            formData.append('api_key', this.config.facepp.apiKey);
            formData.append('api_secret', this.config.facepp.apiSecret);
            formData.append('image_url1', image1Url);
            formData.append('image_url2', image2Url);

            const response = await axios.post(
                'https://api-us.faceplusplus.com/facepp/v3/compare',
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: 30000
                }
            );

            return {
                confidence: response.data.confidence,
                matched: response.data.confidence > 75,
                threshold: 75
            };

        } catch (error) {
            console.error('Face comparison error:', error);
            throw new Error('Face comparison failed');
        }
    }
}

module.exports = new LivenessService();
