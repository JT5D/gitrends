import { defineConfig } from "vite";

export default defineConfig({
	esbuild: {
		jsxFactory: "h",
		jsxFragment: "Fragment",
		jsxInject: `import { h, Fragment } from 'preact'`,
	},
	resolve: {
		alias: {
			react: "preact/compat",
			"react-dom": "preact/compat",
		},
	},
	server: {
		port: 7402,
		proxy: {
			"/api": {
				target: "http://localhost:7401",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
	build: {
		outDir: "dist",
		target: "esnext",
	},
});
