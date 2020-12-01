import AWS from 'aws-sdk'
import { environment } from "./environment"

const s3 = new AWS.S3({
   accessKeyId: environment.AWS_SES_ACCESS_KEY,
   secretAccessKey: environment.AWS_SES_SECRET_ACCESS_KEY,
   region: environment.AWS_SES_REGION
})

export default s3