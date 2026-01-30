#!/usr/bin/env node

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

async function buildIOSBundle() {
	console.log("🚀 Building iOS bundle using Expo export...");

	try {
		// Use Expo export which handles path aliases correctly
		const exportProcess = spawn(
			"yarn",
			["expo", "export", "--platform", "ios"],
			{
				stdio: "inherit",
				cwd: process.cwd(),
			},
		);

		exportProcess.on("close", (code) => {
			if (code === 0) {
				console.log("✅ Bundle created successfully!");

				// Copy the bundle to the iOS directory
				const distDir = path.join(process.cwd(), "dist");
				const iosDir = path.join(process.cwd(), "ios");

				try {
					// Find the generated bundle file
					const jsDir = path.join(distDir, "_expo", "static", "js", "ios");
					const files = fs.readdirSync(jsDir);
					const bundleFile = files.find((file) => file.endsWith(".hbc"));

					if (bundleFile) {
						const sourcePath = path.join(jsDir, bundleFile);
						const destPath = path.join(iosDir, "main.jsbundle");

						fs.copyFileSync(sourcePath, destPath);
						console.log(`📱 Bundle copied to ${destPath}`);

						// Copy assets
						const assetsSourceDir = path.join(distDir, "assets");
						const assetsDestDir = path.join(iosDir, "assets");

						if (fs.existsSync(assetsSourceDir)) {
							// Create assets directory if it doesn't exist
							if (!fs.existsSync(assetsDestDir)) {
								fs.mkdirSync(assetsDestDir, { recursive: true });
							}

							// Copy assets recursively
							copyDirSync(assetsSourceDir, assetsDestDir);
							console.log(`📁 Assets copied to ${assetsDestDir}`);
						}

						console.log(
							"\n🎉 iOS bundle is ready! You can now build your iOS project without running yarn start.",
						);
						console.log(
							"The bundle and assets are located in the ios/ directory.",
						);
					} else {
						console.error("❌ Could not find generated bundle file");
					}
				} catch (error) {
					console.error("❌ Error copying bundle:", error.message);
				}
			} else {
				console.error("❌ Bundle generation failed");
				process.exit(1);
			}
		});
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

function copyDirSync(src, dest) {
	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			if (!fs.existsSync(destPath)) {
				fs.mkdirSync(destPath, { recursive: true });
			}
			copyDirSync(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

buildIOSBundle();
