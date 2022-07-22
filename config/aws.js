// supplies env for server overridden by process.env

module.exports = {
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
  awsBucket: process.env.AWS_BUCKET,
  awsEndpoint: process.env.AWS_ENDPOINT,
  awsRegion: process.env.AWS_REGION,
};
