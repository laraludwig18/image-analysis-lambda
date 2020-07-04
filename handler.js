'use strict';

const axios = require('axios')

class Handler {
  constructor({ rekognitionService, translatorService }) {
    this.rekognitionService = rekognitionService
    this.translatorService = translatorService
  }

  async detectImageLabels(buffer) {
    const result = await this.rekognitionService.detectLabels({
      Image: {
        Bytes: buffer,
      }
    }).promise()

    const workingItems = result.Labels.filter(({ Confidence }) => Confidence > 80)

    const names = workingItems.map(({ Name }) => Name).join(' and ')

    return { names, workingItems }
  }

  async translateText(text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }

    const { TranslatedText: translatedText } = await this.translatorService.translateText(params).promise()

    return translatedText.split(' e ')  
  }

  formatTextResults(texts, workingItems) {
    const finalText = []

    for(const indexText in texts) {
      const nameInPortuguese = texts[indexText]
      const confidence = workingItems[indexText].Confidence

      finalText.push(` ${confidence.toFixed(0)}% de ser do tipo ${nameInPortuguese}`)
    }

    return finalText
  }

  async getImageBuffer(imageUrl) {
    const { data } = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    })

    const buffer = Buffer.from(data, 'base64')
    return buffer
  }

  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters

      const imgBuffer = await this.getImageBuffer(imageUrl)

      const { names, workingItems } = await this.detectImageLabels(imgBuffer)

      const translatedText = await this.translateText(names)

      const finalText = await this.formatTextResults(translatedText, workingItems)

      return {
        statusCode: 200,
        body: `A imagem tem\n `.concat(finalText)
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: 'Internal server error!'
      }
    }
  }
}

const aws = require('aws-sdk');
const rekognitionService = new aws.Rekognition()
const translatorService = new aws.Translate()
const handler = new Handler({ rekognitionService, translatorService })

module.exports.main = handler.main.bind(handler)