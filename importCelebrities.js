'use strict'

const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const CsvReader = require('csv-reader')
const Promise = require('bluebird')
const mysql = require('promise-mysql')
const pinyin = require('pinyin')

const AipFaceClient = require('baidu-aip-sdk').face
const config = require('config')
const baiduConfig = config.get('baiduConfig')
const APP_NAME = baiduConfig.APP_NAME
const APP_KEY = baiduConfig.APP_KEY
const APP_SECRET = baiduConfig.APP_SECRET
const GROUP_ID = baiduConfig.GROUP_ID

const celebrityFile = path.join(__dirname, '/content/celebrity/celebrity.csv')
const imgPath = path.join(__dirname, '/content/celebrity/img/')

const inputStream = fs.createReadStream(celebrityFile, 'utf8')

let images = []
let celebrityList = []

const loopImages = () => {

  images = fs.readdirSync(imgPath)
}

const readCsv = () => {

  return new Promise(resolve => {

    let celebrities = []

    inputStream
      .pipe(CsvReader({
        parseNumbers: true,
        parseBooleans: true,
        trim: true
      }))
      .on('data', function (row) {
        celebrities.push(row)
      })
      .on('end', function () {
        resolve(celebrities)
      })
  })
}

const parseCelebrity = (celebrity) => {

  return new Promise(resolve => {

    let pinyinName = pinyin(name, {
      style: pinyin.STYLE_NORMAL, 
      heteronym: false
    })

    let name = celebrity[1]
    let gender = celebrity[2]
    let dob = celebrity[3]
    let job = celebrity[4]
    let nationality = celebrity[5]
    let birthCity = celebrity[6]
    let desc = celebrity[7]
    let url = celebrity[8]

    let celeb = {
      name: name,
      pinyin: pinyinName,
      gender: gender,
      dob: dob,
      job: job,
      nationality: nationality,
      birthCity: birthCity,
      desc: desc,
      url: url,
      images: []
    }

    let res = findImage(images, pinyinName.join(''))

    res.forEach(r => {
      
      celeb.images.push(`${imgPath}${r}`)
    })

    // console.log(`Name: ${name}, gender: ${gender}, url: ${url}`)
    if (gender == '男' || gender == '女') {
      
      celebrityList.push(celeb)
    } else {

      console.log(celebrity[0], 'wrong gender')
    }
    resolve()
  })
}

const output = () => {

  Promise.each(celebrityList, celebrity => {

    Promise.each(celebrity.images, img => {

      updateUser(`${celebrity.pinyin}_${_.random(10)}`, celebrity.name, img)
    })
  })
}

function updateUser(uid, userInfo, imgPath) {

  return new Promise(function(resolve, reject) {

    let faceClient = new AipFaceClient(APP_NAME, APP_KEY, APP_SECRET)
    let stream = base64Encode(imgPath)
    
    var options = {
      'action_type': 'replace'
    }

    faceClient.updateUser(uid, userInfo, GROUP_ID, stream, options).then(function(result) {
      
      console.log(`Face saves succeed - ${JSON.stringify(result)}`)
      resolve(result)
    }).catch(function(err) {
      // 如果发生网络错误
      console.log(err)
      reject(err)
    })
  })
}


function findImage(images, fileName) {

  let result = []
  images.forEach(i => {

    if (i.indexOf(fileName) > -1) {
      
      result.push(i)
    }
  })
  return result
}

function base64Encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file)
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64')
}

Promise.resolve()
  .then(() => loopImages())
  .then(() => readCsv())
  .each((celebrity) => parseCelebrity(celebrity))
  .then(() => output())

