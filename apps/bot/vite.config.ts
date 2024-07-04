import path from 'path';
import { defineConfig, loadEnv, mergeConfig, UserConfigExport, UserConfig, ConfigEnv } from 'vite';
import proxy from './config/vite/proxy';
import { createVitePlugins } from './config/vite/plugins';
import { VITE_PORT } from './config/constant';
import { generateModifyVars } from './config/themeConfig';

type Mode = 'development' | 'staging' | 'production';

function resolve(dir: string) {
    return path.resolve(__dirname, dir);
}

function getBaseConfig(
    baseUrl: string,
    mode: Mode,
    env: string,
    command: ConfigEnv['command']
): UserConfig {
    const config: UserConfig = {
        base: baseUrl,

        // plugins
        plugins: createVitePlugins(command === 'build', env === 'lib', mode),

        // css
        css: {
            preprocessorOptions: {
                scss: {
                    charset: false,
                    quietDeps: true,
                    modifyVars: generateModifyVars(),
                    javascriptEnabled: true,
                    additionalData: `@use "@/assets/style/import.scss" as *;`,
                    sassOptions: {
                        // 使用双引号
                        doubleQuote: true
                    }
                }
            }
        },

        resolve: {
            alias: {
                '@': resolve('src'),
            },
            dedupe: ['vue']
        },

        build: {
            emptyOutDir: false,
            sourcemap: mode !== 'production'
        }
    };

    // 本地开发环境
    if (command === 'serve') {
        config.server = {
            hmr: { overlay: false }, // 禁用或配置 HMR 连接 设置 server.hmr.overlay 为 false 可以禁用服务器错误遮罩层
            // 服务配置
            port: VITE_PORT, // 类型： number 指定服务器端口;
            open: true, // 类型： boolean | string在服务器启动时自动在浏览器中打开应用程序；
            cors: true, // 类型： boolean | CorsOptions 为开发服务器配置 CORS。默认启用并允许任何源
            host: '0.0.0.0', // IP配置，支持从IP启动
            proxy
        };
    }

    // 线上环境
    if (mode === 'production') {
        config.build!.terserOptions = {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        };
    }

    return config;
}

function getProjectConfig(env: string): UserConfig {
    return {
        build: {
            rollupOptions: {
                input: {
                    ai: resolve('src/chat.ts'),
                    ai_inject: resolve('src/inject.ts')
                },
                output: [
                    {
                        entryFileNames: (chunkInfo) => {
                            switch (chunkInfo.name) {
                                case 'ai':
                                    return 'ai/chat.js';
                                case 'ai_inject':
                                    return 'ai/inject.js';
                                default:
                                    return '[name].[hash].js';
                            }
                        },

                        assetFileNames: (assetInfo) => {
                            switch (assetInfo.name) {
                                case 'ai.css':
                                    return 'ai/chat.css';
                                default:
                                    return 'assets/[name].[hash][extname]';
                            }
                        }
                    }
                ]
            }
        }
    };
}

export default ({ command, mode }: ConfigEnv) => {
    const env = process.env.env || '';
    const url = loadEnv(mode, process.cwd()).VITE_BASEURL;
    const baseConfig: UserConfigExport = getBaseConfig(url, mode as Mode, env, command);
    const config: UserConfigExport = getProjectConfig(env);

    console.log('env:', env, 'command:', command, 'mode:', mode, 'url:', url);
    return defineConfig(mergeConfig(baseConfig, config));
};
