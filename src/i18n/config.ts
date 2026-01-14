import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "app": {
                "name": "DeployMaster",
                "dashboard": "Dashboard",
                "searchPlaceholder": "Search deployments, logs, or servers...",
                "addServer": "Add New Server",
                "deployAll": "Deploy All",
                "stopAll": "Stop All"
            },
            "sidebar": {
                "environments": "Environments",
                "production": "Production",
                "staging": "Staging",
                "development": "Development",
                "showLogs": "Show Logs",
                "hideLogs": "Hide Logs"
            },
            "status": {
                "systemNormal": "System Normal",
                "deploying": "Deploying",
                "loadingLogs": "Loading Logs",
                "live": "Live",
                "error": "Error"
            },
            "modal": {
                "addServer": "Add Server",
                "editServer": "Edit Server",
                "addProject": "Add Project",
                "editProject": "Edit Project"
            },
            "form": {
                "serverName": "Server Name",
                "projectName": "Project Name",
                "targetServer": "Target Server",
                "projectType": "Project Type",
                "host": "Host / IP",
                "port": "Port",
                "username": "Username",
                "password": "Password",
                "privateKey": "Private Key Path",
                "authType": "Auth Type",
                "localPath": "Local Path",
                "remotePath": "Remote Path",
                "artifactPath": "Artifact Path",
                "buildCommand": "Build Command",
                "group": "Environment Group",
                "preDeployCommand": "Pre-Deploy Command",
                "postDeployCommand": "Post-Deploy Command",
                "startCommand": "Start Command",
                "preDeployCommands": "Pre-Deploy Commands",
                "postDeployCommands": "Post-Deploy Commands",
                "preDeployCommandsDesc": "Commands to run locally before deployment",
                "postDeployCommandsDesc": "Commands to run remotely after upload",
                "logSettings": "Log Settings",
                "logCommand": "Log Command",
                "autoViewLog": "Auto view logs after deployment",
                "addCommand": "Add",
                "noCommands": "No commands added. Click 'Add' to create one.",
                "uploadSettings": "Upload Settings",
                "enableUpload": "Enable file upload",
                "enableUploadDesc": "When disabled, skips build and upload. Use for server-side code pulling."
            },
            "common": {
                "save": "Save",
                "cancel": "Cancel",
                "confirmDelete": "Are you sure you want to delete this item?",
                "delete": "Delete",
                "viewLogs": "View Logs",
                "deploy": "Deploy"
            }
        }
    },
    zh: {
        translation: {
            "app": {
                "name": "部署大师",
                "dashboard": "控制台",
                "searchPlaceholder": "搜索部署、日志或服务器...",
                "addServer": "新建服务器",
                "deployAll": "部署全部",
                "stopAll": "停止全部"
            },
            "sidebar": {
                "environments": "环境列表",
                "production": "生产环境",
                "staging": "预发环境",
                "development": "开发环境",
                "showLogs": "显示日志",
                "hideLogs": "隐藏日志"
            },
            "status": {
                "systemNormal": "系统正常",
                "deploying": "部署中",
                "loadingLogs": "加载日志中",
                "live": "运行中",
                "error": "异常"
            },
            "modal": {
                "addServer": "添加服务器",
                "editServer": "编辑服务器",
                "addProject": "添加项目",
                "editProject": "编辑项目"
            },
            "form": {
                "serverName": "服务器名称",
                "projectName": "项目名称",
                "targetServer": "目标服务器",
                "projectType": "项目类型",
                "host": "主机地址 / IP",
                "port": "端口",
                "username": "用户名",
                "password": "密码",
                "privateKey": "私钥路径",
                "authType": "认证方式",
                "localPath": "本地路径",
                "remotePath": "远程路径",
                "artifactPath": "构建产物路径",
                "buildCommand": "构建命令",
                "group": "环境分组",
                "preDeployCommand": "部署前命令",
                "postDeployCommand": "部署后命令",
                "startCommand": "启动命令",
                "preDeployCommands": "部署前命令",
                "postDeployCommands": "部署后命令",
                "preDeployCommandsDesc": "部署前本地执行的命令列表",
                "postDeployCommandsDesc": "上传后远程执行的命令列表",
                "logSettings": "日志设置",
                "logCommand": "日志查看命令",
                "autoViewLog": "部署完成后自动查看日志",
                "addCommand": "添加",
                "noCommands": "暂无命令，点击'添加'创建",
                "uploadSettings": "上传设置",
                "enableUpload": "启用文件上传",
                "enableUploadDesc": "关闭后跳过构建和上传，适用于服务器端拉取代码的场景"
            },
            "common": {
                "save": "保存",
                "cancel": "取消",
                "confirmDelete": "确定要删除此项吗？",
                "delete": "删除",
                "viewLogs": "查看日志",
                "deploy": "部署"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
