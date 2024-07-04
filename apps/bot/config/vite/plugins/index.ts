/**
 * @name createVitePlugins
 * @description 封装plugins数组统一调用
 */
import type { Plugin } from 'vite';
import content from '@originjs/vite-plugin-content';
import vue from '@vitejs/plugin-vue';
import { ConfigSvgIconsPlugin } from './svgIcons';
import { ConfigMockPlugin } from './mock';
import { ConfigVisualizerConfig } from './visualizer';
import { ConfigRestartPlugin } from './restart';
import OptimizationPersist from 'vite-plugin-optimize-persist';
import PkgConfig from 'vite-plugin-package-config';

export function createVitePlugins(isBuild: boolean, isLib: boolean, mode: string) {
    const vitePlugins: (Plugin | Plugin[])[] = [
        content(),
        // vue支持
        vue(),
        // 监听配置文件改动重启
        ConfigRestartPlugin(),
        PkgConfig(),
        OptimizationPersist()
    ];

    // vite-plugin-svg-icons
    vitePlugins.push(ConfigSvgIconsPlugin(isBuild));

    // vite-plugin-mock
    vitePlugins.push(ConfigMockPlugin(isBuild));

    // rollup-plugin-visualizer
    if (!isBuild) vitePlugins.push(ConfigVisualizerConfig());

    return vitePlugins;
}
