import path from 'path';
import vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import ViteCompression from 'vite-plugin-compression';
import { defineConfig, loadEnv } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import tsconfigPaths from 'vite-tsconfig-paths';

const plugins = [
    vue(),
    VueJsx({
        transformOn: true,
        optimize: true
    }),
    tsconfigPaths()
];
const rollupOptionsPlugins = [ViteCompression()];

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, 'env');

    const htmlPlugin = () => {
        return {
            name: 'html-transform',
            transformIndexHtml(html: string) {
                return html.replace(/{{(.*?)}}/g, function (match, p1) {
                    return env[p1];
                });
            }
        };
    };
    plugins.push(htmlPlugin());

    if (mode === 'report') {
        rollupOptionsPlugins.push(
            visualizer({
                open: true,
                gzipSize: true,
                brotliSize: true
            })
        );
    }

    return {
        logLevel: mode === 'production' ? 'silent' : 'info',
        plugins,
        build: {
            rollupOptions: {
                plugins: rollupOptionsPlugins
            },
            terserOptions: {
                compress: {
                    drop_console: mode === 'production',
                    drop_debugger: mode === 'production'
                }
            },
            minify: "terser",
            sourcemap: mode !== 'production'
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
            dedupe: ['vue']
        },
        server: {
            cors: true,
            port: 3002,
            open: true,
            host: '0.0.0.0'
        }
    };
});
