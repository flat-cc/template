import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { cpSync, isDirectory, isFile } from '../utils';

const { showErrorMessage, showWarningMessage } = vscode.window;

/**
 * 获取模板路径
 * @param uri 
 * @returns 
 */
const getTemplatePath = (uri: vscode.Uri): string | undefined => {
  const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  const templatePath = `${rootPath}\\.template`;

  if (!rootPath) {
    showErrorMessage('当前无工作区');
    return;
  }

  const hasTemplateFolder = isDirectory(templatePath);

  if (!hasTemplateFolder) {
    showErrorMessage(`在项目根路径未检索到.template文件夹`, '确定');
    return;
  }
  return templatePath;
};

/**
 * 选择模板
 * @param templatePath 模板路径
 * @param type 
 * @returns 
 */
const selectTemplate = async (templatePath: string, type: 'file' | 'folder'): Promise<string | undefined> => {
  const dirs = fs.readdirSync(templatePath);
  const text = type === 'file' ? '文件' : '文件夹';

  const fileList = dirs.filter((item) => {
    const filepath = path.resolve(templatePath, item);
    if (type === 'file') {
      return isFile(filepath);
    }
    return isDirectory(filepath);
  });

  if (!fileList.length) {
    showWarningMessage(`.template文件夹无模板${text}`);
    return;
  }

  const selectFile = await vscode.window.showQuickPick(fileList, {
    title: `选择模板${text}`,
    placeHolder: `请选择需要创建的模板${text}`,
  });

  return selectFile;
};

/**
 * 创建模板
 * @param uri 
 * @returns 
 */
export const createTemplate = async (uri: vscode.Uri) => {
  const templatePath = getTemplatePath(uri);
  if (!templatePath) {
    return;
  }

  const selectFile = await selectTemplate(templatePath, 'file');

  if (!selectFile) {
    return;
  }

  fs.copyFile(path.resolve(templatePath, selectFile), path.resolve(uri.fsPath, selectFile), (err) => {
    if (err) {
      showErrorMessage(`创建失败：${err}`);
    }
  });
};

/**
 * 创建模板文件夹
 * @param uri 
 * @returns 
 */
export const createTemplateFolder = async (uri: vscode.Uri) => {
  const templatePath = getTemplatePath(uri);
  if (!templatePath) {
    return;
  }

  const selectFile = await selectTemplate(templatePath, 'folder');

  if (!selectFile) {
    return;
  }
  try {
    cpSync(path.resolve(templatePath, selectFile), path.resolve(uri.fsPath, selectFile));
  } catch (error) {
    showErrorMessage(`创建失败：${error}`);
  }
};
