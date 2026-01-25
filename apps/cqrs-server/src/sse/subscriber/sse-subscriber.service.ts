// events.service.ts
import { Injectable, type MessageEvent } from "@nestjs/common";
import { Observable, Subject } from "rxjs";

@Injectable()
export class SseSubscriberService {
	private clients = new Map<string, Subject<MessageEvent>>();

	addClient(clientId: string): Observable<MessageEvent> | null {
		const subject = new Subject<MessageEvent>();

		const sameIdClient = this.clients.get(clientId);

		if (sameIdClient) {
			// throw new Error("Client already exists");
			return null;
		}

		this.clients.set(clientId, subject);

		return new Observable<MessageEvent>((subscriber) => {
			const sub = subject.subscribe(subscriber);

			return () => {
				sub.unsubscribe();
				this.clients.delete(clientId);
			};
		});
	}

	removeClient(clientId: string) {
		const client = this.clients.get(clientId);
		if (client) {
			client.complete();
			this.clients.delete(clientId);
		}
	}

	getClient(clientId: string): Observable<MessageEvent> | null {
		return this.clients.get(clientId) ?? null;
	}

	sendToClient(clientId: string, payload: object) {
		const client = this.clients.get(clientId);
		if (client) {
			client.next({ data: payload });
		}
	}
}
