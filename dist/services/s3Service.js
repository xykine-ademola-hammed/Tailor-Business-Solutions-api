"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3Service {
    constructor() {
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.S3_REGION,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY,
            },
        });
        this.bucketName = process.env.S3_BUCKET;
    }
    async uploadFile(file, fileName, contentType) {
        try {
            const key = `images/${Date.now()}-${fileName}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file,
                ContentType: contentType,
            });
            await this.s3Client.send(command);
            return `https://${this.bucketName}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
        }
        catch (err) {
            console.log(err);
            return err.toString();
        }
    }
    async getSignedUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    async uploadInvoicePDF(pdfBuffer, invoiceNumber) {
        const fileName = `invoice-${invoiceNumber}-${Date.now()}.pdf`;
        return this.uploadFile(pdfBuffer, fileName, "application/pdf");
    }
}
exports.default = new S3Service();
//# sourceMappingURL=s3Service.js.map