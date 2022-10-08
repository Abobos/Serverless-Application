import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('AttachmentUtils')

export class AttachmentUtils {
  constructor(
    private s3 = new XAWS.S3({
      signatureVersion: 'v4'
    }),
    private bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  async getSignedUrl(key: string) {
    logger.info(`getting preSignedUrl for ${key}`)

    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: key,
      Expires: parseInt(this.urlExpiration)
    })
  }

  getUrl(key: string) {
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`
  }
}
