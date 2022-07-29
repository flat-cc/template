import * as fs from 'fs';
import * as path from 'path';
import { version } from 'process';

/** 主要版本 */
const major = version.match(/v([0-9]*).([0-9]*)/)?.[1];
/** 特性版本 */
const minor = version.match(/v([0-9]*).([0-9]*)/)?.[2];

/**
 * 检索路径是否存在
 * @param path 文件路径
 * @returns
 */
export const statSync = (path: fs.PathLike): fs.Stats | undefined => {
  try {
    return fs.statSync(path);
  } catch (error) {
    return undefined;
  }
};

/**
 * 检索路径是否是一个文件夹
 * @param path 文件路径
 * @returns
 */
export const isDirectory = (path: fs.PathLike): Boolean => {
  return statSync(path)?.isDirectory() ?? false;
};

/**
 * 检索路径是否是一个文件
 * @param path 文件路径
 * @returns
 */
export const isFile = (path: fs.PathLike): Boolean => {
  return statSync(path)?.isFile() ?? false;
};

/**
 * 文件夹复制
 * @param {string} source 源文件夹
 * @param {string} destination 目标文件夹
 */
export const cpSync = (source: string, destination: string) => {
  // 判断node版本不是16.7.0以上的版本
  // 则进入兼容处理
  // 这样处理是因为16.7.0的版本支持了直接复制文件夹的操作
  if (Number(major) < 16 || (Number(major) === 16 && Number(minor) < 7)) {
    // 如果存在文件夹 先递归删除该文件夹
    if (fs.existsSync(destination)) {
      fs.rmSync(destination, { recursive: true });
    }
    // 新建文件夹 递归新建
    fs.mkdirSync(destination, { recursive: true });
    // 读取源文件夹
    const rd = fs.readdirSync(source);
    for (const fd of rd) {
      // 循环拼接源文件夹/文件全名称
      const sourceFullName = source + '/' + fd;
      // 循环拼接目标文件夹/文件全名称
      const destFullName = destination + '/' + fd;
      // 读取文件信息
      const lstatRes = fs.lstatSync(sourceFullName);
      // 是否是文件
      if (lstatRes.isFile()) {
        fs.copyFileSync(sourceFullName, destFullName);
      }
      // 是否是文件夹
      if (lstatRes.isDirectory()) {
        cpSync(sourceFullName, destFullName);
      }
    }
  } else {
    fs.cpSync(source, destination, { force: true, recursive: true });
  }
};
