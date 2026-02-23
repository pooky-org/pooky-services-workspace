import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useRuntimeConfig } from "@/src/contexts";

interface EventSourceProps<T> {
	valueSetter: Dispatch<SetStateAction<T>>;
	endpoint: string;
}

export const useEventSource = <T>({
	valueSetter,
	endpoint,
}: EventSourceProps<T>) => {
	const { apiUrl } = useRuntimeConfig();

	useEffect(() => {
		const url = new URL(endpoint, apiUrl);
		const eventSource = new EventSource(url);

		eventSource.onmessage = (event) => {
			const parsedData = JSON.parse(event.data);
			valueSetter(parsedData);
		};

		eventSource.onerror = (err) => {
			console.error("SSE error:", err);
			eventSource.close();
		};

		return () => {
			eventSource.close();
		};
	}, [valueSetter, endpoint, apiUrl]);
};
