"use client";

import { useEffect, useState } from "react";

export default function ModulesHomePage() {
	const [sessionId, setSessionId] = useState<string>("");

	useEffect(() => {
		const existingSessionId = localStorage.getItem("sessionId");

		if (existingSessionId) {
			setSessionId(existingSessionId);
			return;
		}

		const newSessionId = crypto.randomUUID();
		localStorage.setItem("sessionId", newSessionId);
		setSessionId(newSessionId);
	}, []);

	return (
		<main className="min-h-screen flex items-center justify-center p-6">
			<section className="w-full max-w-2xl rounded-2xl border border-black/10 dark:border-white/20 bg-white/70 dark:bg-black/30 backdrop-blur p-6 sm:p-8">
				<h1 className="text-2xl sm:text-3xl font-bold">Accueil des modules</h1>
				<p className="mt-3 text-sm sm:text-base text-black/70 dark:text-white/70">
					UUID de session :
				</p>
				<p className="mt-2 break-all rounded-lg bg-black/5 dark:bg-white/10 px-4 py-3 font-mono text-sm sm:text-base">
					{sessionId || "Chargement de la session..."}
				</p>
				<p className="mt-6 text-sm sm:text-base">
					Rejoins cette session avec un téléphone qui a l&apos;application
					installée.
				</p>
			</section>
		</main>
	);
}
