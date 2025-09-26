import request from '../utils/request'
import { baseUrl } from '../utils/fuckyou'
const requestUrl = `http://${baseUrl}:30080`
// const baseUrl = 'http://www.95qianrushi.cn:30080'
interface TestData {
    name: string
}

interface deviceList{
    productId: string
    deviceName: string
    deviceCode: number
    lastTime: string
    selected?: boolean
}
/* 
获取在线设备列表
*/
export const queryOnlineDeviceList = (data:{}) => {
    return request.post(`${requestUrl}/onenetGateway/api/debug/queryOnlineDeviceList`, {
        
    })
}

/* 
发送检测状态指令
*/
export const sendTestDevice = (deviceList:deviceList[]) => {
    return request.post(`${requestUrl}/onenetGateway/api/debug/sendDetectStateCommand`, {
        deviceList
    })
}

/* 
发送开灯指令
*/
export const sendTurnOnDevice = (deviceList:deviceList[]) => {
    return request.post(`${requestUrl}/onenetGateway/api/debug/sendTurnOnCommand`, {
        deviceList
    })
}
/* 
发送关灯指令
*/
export const sendTurnOffDevice = (deviceList:deviceList[]) => {
    return request.post(`${requestUrl}/onenetGateway/api/debug/sendTurnOffCommand`, {
        deviceList
    })
}
/* 
发送A灯开关指令
*/
export const sendATurnOnDevice = (deviceList:deviceList[]) => {
    return request.post(`${requestUrl}/onenetGateway/api/debug/sendTurnOnLightACommand`, {
        deviceList
    })
}
/* 
发送B灯开关指令
*/
export const sendBTurnOnDevice = (deviceList:deviceList[]) => {
    return request.post(`${requestUrl}/onenetGateway/api/debug/sendTurnOnLightBCommand`, {
        deviceList
    })
}



