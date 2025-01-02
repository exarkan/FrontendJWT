//import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

const Network = registerPlugin('Network');

export async function isCompanyNetwork(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const info = await Network.getWifiInfo();
    return info.ssid === '"YOUR_COMPANY_SSID"';
  }
  return checkBrowserNetwork();
}

async function checkNativeNetwork(): Promise<boolean> {
  const status = await Network.getStatus();
  if (status.connectionType === 'wifi') {
    const wifiInfo = await Network.getWifiInfo();
    return wifiInfo.ssid === 'YOUR_COMPANY_SSID' &&
           wifiInfo.bssid.toUpperCase() === 'XX:XX:XX:XX:XX:XX';
  }
  return false;
}

async function checkBrowserNetwork(): Promise<boolean> {
  // Для браузера проверяем только IP-адреса компании
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const companyIPs = ['XXX.XXX.XXX.XXX']; // Массив IP-адресов компании
    return companyIPs.includes(data.ip);
  } catch {
    return false;
  }
}
