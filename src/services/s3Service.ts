import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_REGION!,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
    });
    this.bucketName = process.env.S3_BUCKET!;
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string
  ): Promise<string> {
    try {
      const key = `images/${Date.now()}-${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      return `https://${this.bucketName}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
    } catch (err: any) {
      console.log(err);
      return err.toString();
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async uploadInvoicePDF(
    pdfBuffer: Buffer,
    invoiceNumber: string
  ): Promise<string> {
    const fileName = `invoice-${invoiceNumber}-${Date.now()}.pdf`;
    return this.uploadFile(pdfBuffer, fileName, "application/pdf");
  }
}

export default new S3Service();
