require('dotenv').config()
const secretKey = process.env.SECRET_KEY
const fs = require('fs').promise
const jwt = require('jsonwebtoken')

function createBearerToken(userID) {
    const payLoad = {
      id: userID, // Đảm bảo rằng userID thực sự được truyền vào đây
    };
    const options = { expiresIn: '30m' }; // token hết hạn trong 30 phút
    return jwt.sign(payLoad, secretKey, options);
  }

function verifyBearerToken (token) {
    try {
        const decoded = jwt.verify(token, secretKey)
        return {success: true, data: decoded}
    } catch (error) {
        return {success: false, error: error.message}
    }
}

async function readJSONFile(path) { // đọc tệp JSON và chuyển nội dung đó thành một object của JS
    try {
        const jsonString = await fs.readFile(path, 'utf8') // tạm dừng hàm cho đến khi thao tác đọc tệp hoàn tất, sau đó nội dung tệp sẽ lưu vào biến jsonString
        return JSON.parse(jsonString)// chuyển đổi chuỗi JSON thành object JS
    } catch (error) {
        console.error(`Failed to read file ${path}`, error)
        throw new Error('File read fail')
    }
}

async function writeJSONFile(path, data) { //ghi dữ liệu của object JS vào một tệp JSON theo đường dẫn chỉ định
    try {
        await fs.writeFile(path, JSON.stringify(//ghi dữ liệu vào tệp theo đường dẫn path
            data, //dữ liệu cần được chuyển thành dạng JSON
            null, //tham số dùng để điều chỉnh thay đổi chuỗi, null là không thay đổi gì
            2) // mức độ thụt lề của JSON, 2 khoảng trắng
        )
    } catch (error) {
        console.error(`Failed to write file ${path}`, error)
        throw new Error('File write fail')
    }
}

const getDataFromRequest = (request) => { //lấy dữ liệu từ một đối tượng yêu cầu HTTP(request)
    return new Promise((resolve, reject) => { //hàm trả về promise, promise thực hiện 2 hàm callback resolve và reject
        let body = '' //lưu trữ dữ liệu nhận được từ request
        request.on('data', (chunk) => { //Sự kiện data được đăng ký để lắng nghe dữ liệu được gửi đến từ request
            body += chunk.toString()//chunk được thêm vào biến body, quá trình này sẽ lặp lại cho đến khi tất cả dữ liệu được nhận
        })
        request.on('end', () => {// Sự kiện end được đăng ký để lắng nghe khi không còn dữ liệu nào nữa từ request
            resolve(JSON.parse(body))//gọi hàm resolve, trả về parsed object cho Promise.
        })
    })
}

module.exports = {
    createBearerToken,
    verifyBearerToken,
    readJSONFile,
    writeJSONFile, 
    getDataFromRequest
}