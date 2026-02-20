import { vercelPreset } from "@vercel/react-router/vite";
import type { Config } from "@react-router/dev/config";

export default {
	// Config options...
	// Server-side render by default, to enable SPA mode set this to `false`
	presets: [vercelPreset()],
	appDirectory: "src",
	ssr: false,
} satisfies Config;
